export const formValidators = {
    notEmptyValidator: {
        validate: (value) => {
            if (value == null || value === undefined) return false;
            // Si es string
            if (typeof value === "string") return value.trim().length > 0;
            // Si es array (por ejemplo FileList)
            if (Array.isArray(value)) return value.length > 0;
            // Si es FileList
            if( value instanceof FileList) return value.length > 0;

            // Si es otra cosa, como un date
            return true; 
            // return value.trim().length > 0;
        },
        message: "The field cannot be empty"
    },
    telephoneValidator: {
        validate: (value) => {
            return value.trim().length === 9 && /^\d+$/.test(value);
        },
        message: "The telephone number must be 9 digits long and contain only numbers"
    },
    notNoneTypeValidator: {
        validate: (value) => {
            return value !== "None";
        },
        message: "Please, select a type"
    },
    validPhoneNumberValidator: {
        validate: (value) => {
            return value.trim().length === 9 && /^\d+$/.test(value);
        },
        message: "The phone number must be 9 digits long and contain only numbers"
    },
    emailValidator: {
        validate: (value) => {
            // Expresión regular para validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },
        message: "Please enter a valid email address (e.g., user@example.com)"
    }
}