import java.math.BigInteger;

class StrToBytes {
    public static void main(String args[]) {
        try {
            String str1 = "nahTf ska rot llehsif h";
            String hexStr = String.format("%x", new BigInteger(1, str1.getBytes()));

            System.out.println("Hex Str is: "+hexStr);
        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }
}