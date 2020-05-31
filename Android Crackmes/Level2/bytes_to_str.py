def le_to_be(le_hex_str):
    be_str = ''
    
    # iterate from length(str) - 2 till 0 and decremenet by 2
    # -2 in the second argument means that exit when index reaches -2
    for i in range(len(le_hex_str)-2, -2, -2):
        be_str += le_hex_str[i:i+2]
    return be_str

if __name__ == "__main__":
    bytes1 = '6e616854'
    bytes2 = '6620736b'
    bytes3 = '6120726f'
    bytes4 = '74206c6c'
    bytes5 = '6568'
    bytes6 = '73696620'
    bytes7 = '68'
    hex_str1 = le_to_be(bytes1) + le_to_be(bytes2) + le_to_be(bytes3) + le_to_be(bytes4) + le_to_be(bytes5) + le_to_be(bytes6) + le_to_be(bytes7)
    
    #bytes_str = bytes.fromhex('6e6168546620736b6120726f74206c6c65687369662068')
    #utf8_str = bytes_str.decode("ascii")
    #print("String is "+utf8_str)

    bytes_str = bytes.fromhex(hex_str1)
    utf8_str = bytes_str.decode("ascii")
    print("String is "+utf8_str)