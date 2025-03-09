import {useState, useCallback} from 'react';

/**
 * Defines the structure of a single validation rule.
 * Each field in your form can have multiple validation criteria.
 */
export type ValidationRule = {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    customValidator?: (value: string) => string | null;
    message?: string;
};

/**
 * Maps form fields to their validation rules.
 * T represents your form data structure.
 */
export type ValidationRules<T> = {
    [K in keyof T]: ValidationRule;
};

/**
 * Maps form fields to their error messages.
 * Undefined means no error for that field.
 */
export type ValidationErrors<T> = {
    [K in keyof T]?: string;
};

/**
 * Maps form fields to boolean flags indicating user interaction.
 * True means the user has interacted with the field.
 */
export type TouchedFields<T> = {
    [K in keyof T]: boolean;
};

/**
 * useFormValidation Hook
 *
 * A flexible form validation hook that handles form state management and validation.
 * Provides real-time validation while maintaining a good user experience by showing
 * errors only after field interaction.
 *
 * Features:
 * - Type-safe form handling
 * - Real-time validation
 * - Smart error display (only after field interaction)
 * - Built-in form state management
 * - Customizable validation rules
 *
 * @example
 * ```typescript
 * const {
 *   formData,
 *   errors,
 *   touchedFields,
 *   handleChange,
 *   handleBlur,
 *   validateForm
 * } = useFormValidation<LoginForm>(
 *   { email: '', password: '' },
 *   {
 *     email: {
 *       required: true,
 *       pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
 *       message: 'Please enter a valid email'
 *     },
 *     password: {
 *       required: true,
 *       minLength: 8,
 *       message: 'Password must be at least 8 characters'
 *     }
 *   }
 * );
 * ```
 *
 * @param initialData - Initial form values
 * @param validationRules - Rules for validating each field
 */
export function useFormValidation<T extends Record<string, any>>(
    initialData: T,
    validationRules: ValidationRules<T>
) {
    const [formData, setFormData] = useState<T>(initialData);
    const [errors, setErrors] = useState<ValidationErrors<T>>({});
    const [touchedFields, setTouchedFields] = useState<TouchedFields<T>>(() => {
        const fields = {} as TouchedFields<T>;
        Object.keys(initialData).forEach((key) => {
            fields[key as keyof T] = false;
        });
        return fields;
    });

    /**
     * Validates a single field based on its validation rules.
     * Returns error message if validation fails, null if passes.
     */
    const validateField = useCallback((field: keyof T, value: string): string | null => {
        const rules = validationRules[field];
        if (rules.required && !value) {
            return rules.message || `${String(field)} is required`;
        }

        const trimmedValue = value.trim();

        if (!trimmedValue && !rules.required) {
            return null;
        }
        if (rules.minLength && trimmedValue.length < rules.minLength) {
            return rules.message || `${String(field)} must be at least ${rules.minLength} characters`;
        }
        if (rules.maxLength && trimmedValue.length > rules.maxLength) {
            return rules.message || `${String(field)} must be less than ${rules.maxLength} characters`;
        }
        if (rules.pattern && !rules.pattern.test(trimmedValue)) {
            return rules.message || `${String(field)} is invalid`;
        }
        if (rules.customValidator) {
            return rules.customValidator(trimmedValue);
        }

        return null;
    }, [validationRules]);

    /**
     * Handles input change events.
     * Updates form data and validates if field was previously touched.
     */
    const handleChange = useCallback((field: keyof T, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));

        if (touchedFields[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({
                ...prev,
                [field]: error || undefined,
            }));
        }
    }, [touchedFields, validateField]);

    /**
     * Handles input blur events.
     * Marks field as touched and triggers validation.
     */
    const handleBlur = useCallback((field: keyof T) => {
        setTouchedFields(prev => ({...prev, [field]: true}));
        const error = validateField(field, formData[field]);
        setErrors(prev => ({
            ...prev,
            [field]: error || undefined,
        }));
    }, [formData, validateField]);

    /**
     * Validates entire form.
     * Returns true if form is valid, false otherwise.
     * Marks all fields as touched and shows all errors.
     */
    const validateForm = useCallback((): boolean => {
        const newErrors: ValidationErrors<T> = {};
        let isValid = true;
        setTouchedFields(
            Object.keys(formData).reduce((acc, key) => {
                acc[key as keyof T] = true;
                return acc;
            }, {} as TouchedFields<T>)
        );

        Object.keys(formData).forEach((key) => {
            const error = validateField(key as keyof T, formData[key as keyof T]);
            if (error) {
                newErrors[key as keyof T] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [formData, validateField]);

    /**
     * Resets form to initial state.
     * Clears all errors and touched states.
     */
    const resetForm = useCallback(() => {
        setFormData(initialData);
        setErrors({});
        setTouchedFields(Object.keys(initialData).reduce((acc, key) => {
            acc[key as keyof T] = false;
            return acc;
        }, {} as TouchedFields<T>));
    }, [initialData]);

    return {
        formData,
        errors,
        touchedFields,
        setFormData,
        handleChange,
        handleBlur,
        validateForm,
        resetForm,
        isValid: Object.keys(errors).length === 0
    };
} 