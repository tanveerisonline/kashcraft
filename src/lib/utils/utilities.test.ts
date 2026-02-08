import { cn } from "@/lib/utils/cn";

describe("Utility Functions", () => {
  describe("cn - Class Merge", () => {
    it("should merge className strings", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toContain("py-1");
      expect(result).toContain("px-4");
      expect(result).not.toContain("px-2");
    });

    it("should handle conditional classes", () => {
      const isActive = true;
      const result = cn("base", isActive && "active");
      expect(result).toContain("base");
      expect(result).toContain("active");
    });

    it("should filter out false values", () => {
      const result = cn("base", false && "hidden", "visible");
      expect(result).toContain("base");
      expect(result).toContain("visible");
      expect(result).not.toContain("hidden");
    });

    it("should handle empty strings", () => {
      const result = cn("", "valid");
      expect(result).toBe("valid");
    });

    it("should handle undefined values", () => {
      const result = cn("base", undefined, "visible");
      expect(result).toContain("base");
      expect(result).toContain("visible");
    });

    it("should handle array of classes", () => {
      const classes = ["px-2", "py-1"];
      const result = cn(classes);
      expect(result).toContain("px-2");
      expect(result).toContain("py-1");
    });
  });
});

// Format utilities tests
describe("Format Utilities", () => {
  describe("formatPrice", () => {
    it("should format price with currency symbol", () => {
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price);
      };

      expect(formatPrice(99.99)).toBe("$99.99");
      expect(formatPrice(1000)).toBe("$1,000.00");
    });

    it("should handle zero price", () => {
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price);
      };

      expect(formatPrice(0)).toBe("$0.00");
    });

    it("should handle negative price", () => {
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(price);
      };

      expect(formatPrice(-50)).toBe("-$50.00");
    });
  });

  describe("formatDate", () => {
    it("should format date correctly", () => {
      const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat("en-US").format(date);
      };

      const testDate = new Date("2024-01-15");
      const result = formatDate(testDate);

      expect(result).toMatch(/01\/15\/2024|1\/15\/2024/);
    });

    it("should format date with time", () => {
      const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
      };

      const testDate = new Date("2024-01-15T14:30:00");
      const result = formatDateTime(testDate);

      expect(result).toMatch(/01\/15\/2024/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe("formatPhoneNumber", () => {
    it("should format 10-digit US phone number", () => {
      const formatPhone = (phone: string) => {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length !== 10) return phone;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      };

      expect(formatPhone("2125551234")).toBe("(212) 555-1234");
    });

    it("should handle already formatted number", () => {
      const formatPhone = (phone: string) => {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length !== 10) return phone;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      };

      expect(formatPhone("(212) 555-1234")).toBe("(212) 555-1234");
    });
  });
});

// Validation utilities tests
describe("Validation Utilities", () => {
  describe("isValidEmail", () => {
    const isValidEmail = (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    it("should validate basic email", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
    });

    it("should reject invalid email", () => {
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    const isValidPassword = (password: string) => {
      // At least 8 chars, 1 uppercase, 1 number, 1 special char
      const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      return regex.test(password);
    };

    it("should validate strong password", () => {
      expect(isValidPassword("StrongPass1!")).toBe(true);
    });

    it("should reject weak passwords", () => {
      expect(isValidPassword("weak")).toBe(false);
      expect(isValidPassword("weakpassword")).toBe(false);
      expect(isValidPassword("WeakPass1")).toBe(false);
    });
  });

  describe("isValidZipCode", () => {
    const isValidZipCode = (zip: string) => {
      return /^\d{5}(-\d{4})?$/.test(zip);
    };

    it("should validate 5-digit zip", () => {
      expect(isValidZipCode("10001")).toBe(true);
    });

    it("should validate zip+4 format", () => {
      expect(isValidZipCode("10001-1234")).toBe(true);
    });

    it("should reject invalid zip", () => {
      expect(isValidZipCode("1000")).toBe(false);
      expect(isValidZipCode("ABC12")).toBe(false);
    });
  });
});

// String utilities tests
describe("String Utilities", () => {
  describe("capitalize", () => {
    const capitalize = (str: string) => {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1);
    };

    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("HELLO")).toBe("HELLO");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });
  });



  describe("truncate", () => {
    const truncate = (str: string, length: number) => {
      if (str.length <= length) return str;
      return str.slice(0, length) + "...";
    };

    it("should truncate long string", () => {
      expect(truncate("This is a long string", 10)).toBe("This is a ...");
    });

    it("should not truncate short string", () => {
      expect(truncate("Short", 10)).toBe("Short");
    });
  });
});

// Array utilities tests
describe("Array Utilities", () => {
  describe("unique", () => {
    const unique = <T>(arr: T[]): T[] => {
      return [...new Set(arr)];
    };

    it("should remove duplicates", () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(["a", "b", "a"])).toEqual(["a", "b"]);
    });

    it("should handle empty array", () => {
      expect(unique([])).toEqual([]);
    });
  });

  describe("chunk", () => {
    const chunk = <T>(arr: T[], size: number): T[][] => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    it("should split array into chunks", () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it("should handle exact division", () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });
  });
});

// Math utilities tests
describe("Math Utilities", () => {
  describe("calculateDiscount", () => {
    const calculateDiscount = (original: number, percentage: number) => {
      return original * (1 - percentage / 100);
    };

    it("should calculate discount correctly", () => {
      expect(calculateDiscount(100, 10)).toBe(90);
      expect(calculateDiscount(50, 20)).toBe(40);
    });

    it("should handle edge cases", () => {
      expect(calculateDiscount(100, 0)).toBe(100);
      expect(calculateDiscount(100, 100)).toBe(0);
    });
  });

  describe("round", () => {
    const round = (num: number, decimals: number = 2) => {
      return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    };

    it("should round to decimal places", () => {
      expect(round(99.999, 2)).toBe(100);
      expect(round(99.994, 2)).toBe(99.99);
    });

    it("should round to nearest integer", () => {
      expect(round(99.5, 0)).toBe(100);
      expect(round(99.4, 0)).toBe(99);
    });
  });
});
