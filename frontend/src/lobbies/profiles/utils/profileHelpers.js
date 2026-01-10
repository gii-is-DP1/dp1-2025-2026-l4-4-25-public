/**
 * Prepara los inputs del formulario con valores iniciales del perfil
 * @param {Array} formTemplate - Template del formulario
 * @param {Object} profileData - Datos del perfil del usuario
 * @returns {Array} - Inputs con valores por defecto
 */
export const prepareFormInputs = (formTemplate, profileData) => {
  if (!formTemplate || !profileData) return [];

  return formTemplate.map(input => {
    let defaultValue = profileData[input.name] ?? "";

    // El campo password debe mostrarse vacío, no el hash del backend
    if (input.name === 'password') {
      defaultValue = "";
    }

    return {
      ...input,
      defaultValue: defaultValue
    };
  });
};

/**
 * Construye el objeto de request para actualizar el perfil
 * @param {Object} values - Valores del formulario
 * @param {string} profileImage - Imagen del perfil (base64)
 * @returns {Object} - Request body para PUT
 */
export const buildUpdateProfileRequest = (values, profileImage) => {
  return {
    username: values.username,
    password: values.password,
    name: values.name,
    email: values.email,
    birthDate: values.birthDate,
    image: profileImage
  };
};

/**
 * Valida si la imagen es una URL válida o base64
 * @param {string} imageData - Datos de la imagen
 * @returns {boolean} - True si es válida
 */
export const isValidImage = (imageData) => {
  if (!imageData) return false;
  
  // Verificar si es una URL válida o base64
  return (
    imageData.startsWith('http') || 
    imageData.startsWith('data:image')
  );
};
