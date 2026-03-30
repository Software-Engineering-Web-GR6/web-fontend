import { useState, useCallback } from "react";

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  custom?: (value: string) => string | null;
}

interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const validateField = useCallback(
    (name: string, value: string, rules: ValidationRules): ValidationResult => {
      if (rules.required && !value.trim()) {
        return { isValid: false, error: "Trường này là bắt buộc" };
      }

      if (rules.minLength && value.length < rules.minLength) {
        return {
          isValid: false,
          error: `Tối thiểu ${rules.minLength} ký tự`,
        };
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        return {
          isValid: false,
          error: `Tối đa ${rules.maxLength} ký tự`,
        };
      }

      if (rules.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { isValid: false, error: "Email không hợp lệ" };
        }
      }

      if (rules.pattern && !rules.pattern.test(value)) {
        return { isValid: false, error: "Định dạng không hợp lệ" };
      }

      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
          return { isValid: false, error: customError };
        }
      }

      return { isValid: true, error: null };
    },
    [],
  );

  const validate = useCallback(
    (name: string, value: string, rules: ValidationRules) => {
      const result = validateField(name, value, rules);
      setErrors((prev) => ({ ...prev, [name]: result.error }));
      return result.isValid;
    },
    [validateField],
  );

  const clearError = useCallback((name: string) => {
    setErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getPasswordStrength = useCallback(
    (
      password: string,
    ): {
      strength: "weak" | "medium" | "strong";
      score: number;
      feedback: string;
    } => {
      let score = 0;

      if (password.length >= 8) score++;
      if (password.length >= 12) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^a-zA-Z0-9]/.test(password)) score++;

      if (score <= 2) {
        return {
          strength: "weak",
          score: score * 16.67,
          feedback: "Mật khẩu yếu",
        };
      } else if (score <= 4) {
        return {
          strength: "medium",
          score: score * 16.67,
          feedback: "Mật khẩu trung bình",
        };
      } else {
        return {
          strength: "strong",
          score: score * 16.67,
          feedback: "Mật khẩu mạnh",
        };
      }
    },
    [],
  );

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
    getPasswordStrength,
  };
};
