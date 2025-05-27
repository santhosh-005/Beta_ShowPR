export async function encrypt(text) {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  
  const keyData = Buffer.from(process.env.AES_KEY, 'hex');
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt']
  );
  
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    data
  );
  
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const encryptedHex = Array.from(encryptedArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const ivHex = Array.from(iv)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return {
    encryptedData: encryptedHex,
    iv: ivHex,
  };
}

export async function decrypt(encryptedHex, ivHex) {
  const ivArray = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  const encryptedArray = new Uint8Array(encryptedHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  const keyData = Buffer.from(process.env.AES_KEY, 'hex');
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-CBC', length: 256 },
    false,
    ['decrypt']
  );
  
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: ivArray },
    key,
    encryptedArray
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}