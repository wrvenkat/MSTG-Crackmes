import lief

def instrument_init_array():
    libfoo = lief.parse('libfoo.so')

    if lief.ELF.DYNAMIC_TAGS.INIT_ARRAY in libfoo:
        array = libfoo[lief.ELF.DYNAMIC_TAGS.INIT_ARRAY]
        print(array)
        print(hex(array[0]))
        
        # add a new entry
        # which points to the main function which does nothing
        array.insert(0,0x0f78)

        # remove the old entry
        array.remove(array[1])

        # write out the modification
        libfoo.write('libfoo-mod.so')
        print("Modified the INIT_0 address to main()")

        libfoomod = lief.parse('libfoo-mod.so')
        if lief.ELF.DYNAMIC_TAGS.INIT_ARRAY in libfoomod:
            print("After mod: ")
            print(libfoomod[lief.ELF.DYNAMIC_TAGS.INIT_ARRAY])

if __name__ == "__main__":
    instrument_init_array()