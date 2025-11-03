Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const {
      pixKey,
      pixKeyType,
      amount,
      recipientName,
      city = 'SAO PAULO',
      txid
    } = await req.json();

    if (!pixKey || !pixKeyType || !amount || !recipientName) {
      throw new Error('Parametros obrigatorios: pixKey, pixKeyType, amount, recipientName');
    }

    // Gerar PIX copia e cola (EMV QRCode)
    const pixPayload = generatePixPayload({
      pixKey,
      pixKeyType,
      amount,
      recipientName,
      city,
      txid: txid || generateTxId()
    });

    // Em produção, você pode usar uma API de QR Code como:
    // - API do Banco Central (PIX API)
    // - Serviços de pagamento (Mercado Pago, PagSeguro, etc)
    // Por enquanto, vamos gerar o formato padrão EMV
    
    const result = {
      pixQrCodeText: pixPayload,
      pixQrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayload)}`,
      txid: txid || generateTxId(),
      amount: parseFloat(amount).toFixed(2),
      recipientName,
      pixKey,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
    };

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao gerar QR Code PIX:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'PIX_GENERATION_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Gera ID de transação único
function generateTxId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let txid = '';
  for (let i = 0; i < 25; i++) {
    txid += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return txid;
}

// Gera payload PIX no formato EMV QRCode
function generatePixPayload(params: {
  pixKey: string;
  pixKeyType: string;
  amount: number;
  recipientName: string;
  city: string;
  txid: string;
}): string {
  const { pixKey, amount, recipientName, city, txid } = params;

  // Formato EMV QRCode para PIX
  // ID 00: Payload Format Indicator
  const payloadFormatIndicator = formatEMV('00', '01');
  
  // ID 26: Merchant Account Information
  const merchantAccountInfo = formatEMV('26', [
    formatEMV('00', 'br.gov.bcb.pix'),
    formatEMV('01', pixKey),
  ].join(''));

  // ID 52: Merchant Category Code
  const merchantCategoryCode = formatEMV('52', '0000');

  // ID 53: Transaction Currency (986 = BRL)
  const transactionCurrency = formatEMV('53', '986');

  // ID 54: Transaction Amount
  const transactionAmount = formatEMV('54', amount.toFixed(2));

  // ID 58: Country Code
  const countryCode = formatEMV('58', 'BR');

  // ID 59: Merchant Name
  const merchantName = formatEMV('59', recipientName.substring(0, 25).toUpperCase());

  // ID 60: Merchant City
  const merchantCity = formatEMV('60', city.substring(0, 15).toUpperCase());

  // ID 62: Additional Data Field Template
  const additionalDataField = formatEMV('62', formatEMV('05', txid));

  // Combinar todos os campos
  let payload = payloadFormatIndicator +
                merchantAccountInfo +
                merchantCategoryCode +
                transactionCurrency +
                transactionAmount +
                countryCode +
                merchantName +
                merchantCity +
                additionalDataField;

  // ID 63: CRC16
  payload += '6304';
  const crc = calculateCRC16(payload);
  payload += crc;

  return payload;
}

// Formata campo EMV
function formatEMV(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return id + length + value;
}

// Calcula CRC16 (CCITT)
function calculateCRC16(payload: string): string {
  let crc = 0xFFFF;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= (payload.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
    }
  }

  crc &= 0xFFFF;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
