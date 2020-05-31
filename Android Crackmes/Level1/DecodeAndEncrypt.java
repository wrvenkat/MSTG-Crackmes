import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

class DecodeAndEncrypt {
    private static String obfuscatedKey = "8d127684cbc37c17616d806cf50473cc";
    private static String b64EncodedValue = "5UJiFctbmgbDoLXmpL12mkno8HT4Lv8dlat8FxR2GOc=";

    private byte[] deobfuscate(String str) {
        int length = str.length();
        byte[] bArr = new byte[(length / 2)];

        for (int i = 0; i < length; i += 2) {
            bArr[i / 2] = (byte) ((Character.digit(str.charAt(i), 16) << 4) + Character.digit(str.charAt(i + 1), 16));
        }
        return bArr;
    }

    public byte[] encrypt(byte[] key, byte[] value) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key, "AES");
            Cipher instance = Cipher.getInstance("AES");
            instance.init(2, secretKeySpec);
            return instance.doFinal(value);
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return new byte[2];
    }
    public static void main(String args[]) {
        DecodeAndEncrypt solution = new DecodeAndEncrypt();
        byte[] encyrptedByte = solution.encrypt(solution.deobfuscate(obfuscatedKey), Base64.getDecoder().decode(b64EncodedValue));
        System.out.println("Encrypted String is "+new String(encyrptedByte));
    }
}