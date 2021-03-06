(function() {
  var ID = require('../src/ID');

  describe("ID", function() {
    var id;

    beforeEach(function() {
      id = ID.create("test");
    });

    describe("#compareTo", function() {
      it("should return 1 if it is greater than other ID", function() {
        var otherId = ID.create("test");
        for (var i = 0; i < ID._BYTE_SIZE; i++) {
          otherId._bytes[i] = 0x00;
          if (id._bytes[i] !== 0x00) {
            break;
          }
        }
        expect(id.compareTo(otherId)).toBe(1);
      });

      it("should return -1 if it is smaller than other ID", function() {
        var otherId = ID.create("test");
        for (var i = 0; i < ID._BYTE_SIZE; i++) {
          otherId._bytes[i] = 0xff;
          if (id._bytes[i] !== 0xff) {
            break;
          }
        }
        expect(id.compareTo(otherId)).toBe(-1);
      });

      it("should return 0 if it is equal to other ID", function() {
        var otherId = ID.create("test");
        expect(id.compareTo(otherId)).toBe(0);
      });
    });

    describe("#equals", function() {
      it("should be equal to the same ID", function() {
        var otherId = ID.create("test");
        expect(id.equals(otherId)).toBeTruthy();
      });

      it("should not be equal to different ID", function() {
        var otherId = ID.create("other");
        expect(id.equals(otherId)).toBeFalsy();
      });

      it("should have reflexivity rule", function() {
        expect(id.equals(id)).toBeTruthy();
      });

      it("should have symmetry rule", function() {
        var otherId = ID.create("test");
        expect(id.equals(otherId)).toBeTruthy();
        expect(otherId.equals(id)).toBeTruthy();

        otherId = ID.create("other");
        expect(id.equals(otherId)).toBeFalsy();
        expect(otherId.equals(id)).toBeFalsy();
      });

      it("should have transitivity rule", function() {
        var otherId1 = ID.create("test");
        var otherId2 = ID.create("test");
        expect(id.equals(otherId1)).toBeTruthy();
        expect(otherId1.equals(otherId2)).toBeTruthy();
        expect(id.equals(otherId2)).toBeTruthy();
      });
    });

    describe("#toHexString", function() {
      it("should generate hex string", function() {
        var id = new ID([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                         0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
                         0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
                         0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f]);
        expect(id.toHexString()).toBe("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");
      });
    });

    describe("#fromHexString", function() {
      it("should generate hex string", function() {
        var id = ID.fromHexString("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");
        var otherId = new ID([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07,
                              0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
                              0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17,
                              0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f]);
        expect(id).toEqualId(otherId);
      });

      it("should throw error if invalid string passed", function() {
        expect(function() { ID.fromHexString(""); }).toThrow();
        expect(function() { ID.fromHexString("ffffffff"); }).toThrow();
        expect(function() {
          ID.fromHexString("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");
        }).toThrow();
      });
    });

    describe("#isInInterval", function() {
      var smallerId, largerId;

      beforeEach(function() {
        smallerId = ID.create("test");
        largerId = ID.create("test");
        for (var i = 0; i < ID._BYTE_SIZE; i++) {
          smallerId._bytes[i] = 0x00;
          if (id._bytes[i] !== 0x00) {
            break;
          }
        }
        for (var i = 0; i < ID._BYTE_SIZE; i++) {
          largerId._bytes[i] = 0xff;
          if (id._bytes[i] !== 0xff) {
            break;
          }
        }
      });

      it("should return true if id is in interval between two other IDs", function() {
        expect(id.isInInterval(smallerId, largerId)).toBeTruthy();
      });

      it("should return false if id is not in interval between two other IDs", function() {
        expect(id.isInInterval(largerId, smallerId)).toBeFalsy();
        expect(smallerId.isInInterval(id, largerId)).toBeFalsy();
      });

      it("should understand ID space is ring", function() {
        expect(largerId.isInInterval(id, smallerId)).toBeTruthy();
        expect(smallerId.isInInterval(largerId, id)).toBeTruthy();
      });

      it("should appropriately process max and min IDs", function() {
        var minId = ID.fromHexString("0000000000000000000000000000000000000000000000000000000000000000");
        var maxId = ID.fromHexString("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

        expect(minId.isInInterval(smallerId, largerId)).toBeFalsy();
        expect(maxId.isInInterval(smallerId, largerId)).toBeFalsy();
        expect(minId.isInInterval(largerId, smallerId)).toBeTruthy();
        expect(maxId.isInInterval(largerId, smallerId)).toBeTruthy();
      });

      it("should return false if from or to are same as the sample", function() {
        expect(smallerId.isInInterval(smallerId, largerId)).toBeFalsy();
        expect(smallerId.isInInterval(largerId, smallerId)).toBeFalsy();
        expect(largerId.isInInterval(smallerId, largerId)).toBeFalsy();
        expect(largerId.isInInterval(largerId, largerId)).toBeFalsy();
      });
    });

    describe("#addPowerOfTwo", function() {
      it("should return ID added power of two", function() {
        id = ID.fromHexString("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");
        expect(id.addPowerOfTwo(0)).toEqualId(
          ID.fromHexString("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e20"));
        expect(id.addPowerOfTwo(1)).toEqualId(
          ID.fromHexString("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e21"));
        expect(id.addPowerOfTwo(16)).toEqualId(
          ID.fromHexString("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1e1e1f"));
        expect(id.addPowerOfTwo(255)).toEqualId(
          ID.fromHexString("800102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f"));
        expect(ID.fromHexString("800102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f")
               .addPowerOfTwo(255)).toEqualId(id);
        expect(ID.fromHexString("00000000000000000000000000000000ffffffffffffffffffffffffffffffff")
               .addPowerOfTwo(0)).toEqualId(
                 ID.fromHexString("0000000000000000000000000000000100000000000000000000000000000000"));
      });
    });

    describe("#add", function() {
      it("should return the sum of the two IDs", function() {
        var id1 = ID.fromHexString("0000000000000000000000000000000000000000000000000000000000000000");
        var id2 = ID.fromHexString("00000000000000000000000000000000ffffffffffffffffffffffffffffffff");
        var id3 = ID.fromHexString("0000000000000000ffffffffffffffffffffffffffffffff0000000000000000");
        var id4 = ID.fromHexString("ffffffffffffffffffffffffffffffff00000000000000000000000000000000");

        expect(id1.add(id1).toHexString()).toBe("0000000000000000000000000000000000000000000000000000000000000000");
        expect(id1.add(id2).toHexString()).toBe("00000000000000000000000000000000ffffffffffffffffffffffffffffffff");
        expect(id1.add(id3).toHexString()).toBe("0000000000000000ffffffffffffffffffffffffffffffff0000000000000000");
        expect(id1.add(id4).toHexString()).toBe("ffffffffffffffffffffffffffffffff00000000000000000000000000000000");

        expect(id2.add(id1)).toEqualId(id1.add(id2));
        expect(id2.add(id2).toHexString()).toBe("00000000000000000000000000000001fffffffffffffffffffffffffffffffe");
        expect(id2.add(id3).toHexString()).toBe("00000000000000010000000000000000fffffffffffffffeffffffffffffffff");
        expect(id2.add(id4).toHexString()).toBe("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")

        expect(id3.add(id1)).toEqualId(id1.add(id3));
        expect(id3.add(id2)).toEqualId(id2.add(id3));
        expect(id3.add(id3).toHexString()).toBe("0000000000000001fffffffffffffffffffffffffffffffe0000000000000000");
        expect(id3.add(id4).toHexString()).toBe("0000000000000000fffffffffffffffeffffffffffffffff0000000000000000");

        expect(id4.add(id1)).toEqualId(id1.add(id4));
        expect(id4.add(id2)).toEqualId(id2.add(id4));
        expect(id4.add(id3)).toEqualId(id3.add(id4));
        expect(id4.add(id4).toHexString()).toBe("fffffffffffffffffffffffffffffffe00000000000000000000000000000000");
      });
    });

    describe("#sub", function() {
      it("should return the difference between the two IDs", function() {
        var id1 = ID.fromHexString("0000000000000000000000000000000000000000000000000000000000000000");
        var id2 = ID.fromHexString("00000000000000000000000000000000ffffffffffffffffffffffffffffffff");
        var id3 = ID.fromHexString("0000000000000000ffffffffffffffffffffffffffffffff0000000000000000");
        var id4 = ID.fromHexString("ffffffffffffffffffffffffffffffff00000000000000000000000000000000");

        expect(id1.sub(id1).toHexString()).toBe("0000000000000000000000000000000000000000000000000000000000000000");
        expect(id1.sub(id2).toHexString()).toBe("ffffffffffffffffffffffffffffffff00000000000000000000000000000001");
        expect(id1.sub(id3).toHexString()).toBe("ffffffffffffffff000000000000000000000000000000010000000000000000");
        expect(id1.sub(id4).toHexString()).toBe("0000000000000000000000000000000100000000000000000000000000000000");

        expect(id2.sub(id1).toHexString()).toBe("00000000000000000000000000000000ffffffffffffffffffffffffffffffff");
        expect(id2.sub(id2).toHexString()).toBe("0000000000000000000000000000000000000000000000000000000000000000");
        expect(id2.sub(id3).toHexString()).toBe("ffffffffffffffff00000000000000010000000000000000ffffffffffffffff");
        expect(id2.sub(id4).toHexString()).toBe("00000000000000000000000000000001ffffffffffffffffffffffffffffffff");

        expect(id3.sub(id1).toHexString()).toBe("0000000000000000ffffffffffffffffffffffffffffffff0000000000000000");
        expect(id3.sub(id2).toHexString()).toBe("0000000000000000fffffffffffffffeffffffffffffffff0000000000000001");
        expect(id3.sub(id3).toHexString()).toBe("0000000000000000000000000000000000000000000000000000000000000000");
        expect(id3.sub(id4).toHexString()).toBe("00000000000000010000000000000000ffffffffffffffff0000000000000000");

        expect(id4.sub(id1).toHexString()).toBe("ffffffffffffffffffffffffffffffff00000000000000000000000000000000");
        expect(id4.sub(id2).toHexString()).toBe("fffffffffffffffffffffffffffffffe00000000000000000000000000000001");
        expect(id4.sub(id3).toHexString()).toBe("fffffffffffffffeffffffffffffffff00000000000000010000000000000000");
        expect(id4.sub(id4).toHexString()).toBe("0000000000000000000000000000000000000000000000000000000000000000");
      });
    });

    describe("#getIntervalInPowerOfTwoFrom", function() {
      it("should return the interval from the passed ID", function() {
        var id1 = ID.fromHexString("0000000000000000000000000000000000000000000000000000000000000000");
        var id2 = ID.fromHexString("0000000000000000000000000000000000000000000000000000000000000001");
        var id3 = ID.fromHexString("00000000000000000000000000000000000000000000000000000000000000ff");
        var id4 = ID.fromHexString("ffffffffffffffffffffffffffffffff00000000000000000000000000000000");

        expect(id1.getIntervalInPowerOfTwoFrom(id1)).toBe(-Infinity);
        expect(id1.getIntervalInPowerOfTwoFrom(id2)).toBe(255);
        expect(id1.getIntervalInPowerOfTwoFrom(id3)).toBe(255);
        expect(id1.getIntervalInPowerOfTwoFrom(id4)).toBe(128);

        expect(id2.getIntervalInPowerOfTwoFrom(id1)).toBe(0);
        expect(id2.getIntervalInPowerOfTwoFrom(id2)).toBe(-Infinity);
        expect(id2.getIntervalInPowerOfTwoFrom(id3)).toBe(255);
        expect(id2.getIntervalInPowerOfTwoFrom(id4)).toBe(128);

        expect(id3.getIntervalInPowerOfTwoFrom(id1)).toBe(7);
        expect(id3.getIntervalInPowerOfTwoFrom(id2)).toBe(7);
        expect(id3.getIntervalInPowerOfTwoFrom(id3)).toBe(-Infinity);
        expect(id3.getIntervalInPowerOfTwoFrom(id4)).toBe(128);

        expect(id4.getIntervalInPowerOfTwoFrom(id1)).toBe(255);
        expect(id4.getIntervalInPowerOfTwoFrom(id2)).toBe(255);
        expect(id4.getIntervalInPowerOfTwoFrom(id3)).toBe(255);
        expect(id4.getIntervalInPowerOfTwoFrom(id4)).toBe(-Infinity);
      });
    });
  });
})();
