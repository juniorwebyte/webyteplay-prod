// Verificação detalhada do payload PIX
function addTLV(id, value) {
  const length = value.length.toString().padStart(2, '0')
  return id + length + value
}

function crc16CCITT(str) {
  const polynomial = 0x1021
  let crc = 0xFFFF

  for (let i = 0; i < str.length; i++) {
    crc ^= (str.charCodeAt(i) << 8) & 0xFFFF

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) & 0xFFFF) ^ polynomial
      } else {
        crc = (crc << 1) & 0xFFFF
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function gerarPixCopiaECola(chavePix, tipoChave, nomeRecebedor, cidadeRecebedor, valor, txId) {
  let payload = ''

  // 00 - Payload Format Indicator (obrigatório)
  payload += addTLV('00', '01')

  // 26 - Merchant Account Information (PIX)
  let merchantAccount = ''
  merchantAccount += addTLV('00', 'br.gov.bcb.pix')  // GUI
  merchantAccount += addTLV('01', chavePix)          // Chave PIX
  payload += addTLV('26', merchantAccount)

  // 52 - Merchant Category Code
  payload += addTLV('52', '0000')

  // 53 - Transaction Currency (986 = BRL)
  payload += addTLV('53', '986')

  // 54 - Transaction Amount
  payload += addTLV('54', valor.toFixed(2))

  // 58 - Country Code
  payload += addTLV('58', 'BR')

  // 59 - Merchant Name
  const nome = nomeRecebedor.substring(0, 25).toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  payload += addTLV('59', nome)

  // 60 - Merchant City
  const cidade = cidadeRecebedor.substring(0, 15).toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  payload += addTLV('60', cidade)

  // 62 - Additional Data Field (txid)
  const txIdClean = txId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25)
  payload += addTLV('62', addTLV('05', txIdClean))

  // 63 - CRC16
  payload += '6304'
  const crc = crc16CCITT(payload)
  payload += crc

  return payload
}

function analisarPayload(payload) {
  console.log('=== ANÁLISE DETALHADA DO PAYLOAD ===')
  console.log('Payload completo:', payload)
  console.log('Comprimento total:', payload.length)

  // Quebrar em campos TLV
  let pos = 0
  const campos = []

  while (pos < payload.length - 8) { // -8 para não incluir o CRC
    const id = payload.substr(pos, 2)
    const length = parseInt(payload.substr(pos + 2, 2))
    const value = payload.substr(pos + 4, length)

    campos.push({ id, length, value })
    pos += 4 + length
  }

  console.log('\nCampos TLV encontrados:')
  campos.forEach((campo, index) => {
    console.log(`${index + 1}. ID ${campo.id}: Length ${campo.length}, Value: "${campo.value}"`)
  })

  // Verificar CRC
  const crcIndex = payload.lastIndexOf('63')
  if (crcIndex !== -1) {
    const crcRecebido = payload.substring(crcIndex + 4, crcIndex + 8)
    const payloadSemCrc = payload.substring(0, crcIndex + 4)
    const crcCalculado = crc16CCITT(payloadSemCrc)

    console.log('\n=== VERIFICAÇÃO CRC ===')
    console.log('Payload sem CRC:', payloadSemCrc)
    console.log('CRC recebido:', crcRecebido)
    console.log('CRC calculado:', crcCalculado)
    console.log('CRC válido:', crcRecebido === crcCalculado)
  }

  return campos
}

// Teste com a chave que o usuário mencionou
console.log('Testando com a chave UUID mencionada pelo usuário:')
const payload = gerarPixCopiaECola('4041f9dc-23a6-44fc-9c0e-2213d8f28515', 'aleatoria', 'WEBYTEPLAY', 'SAO PAULO', 10.00, 'TESTE123')
analisarPayload(payload)