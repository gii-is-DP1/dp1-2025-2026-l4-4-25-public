export const prepareFormInputs = (formTemplate, profileData) => {
  if (!formTemplate || !profileData) return [];

  return formTemplate.map(input => {
    let defaultValue = profileData[input.name] ?? "";
    if (input.name === 'password') {
      defaultValue = "";
    }

    return {
      ...input,
      defaultValue: defaultValue
    };
  });
};

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

export const isValidImage = (imageData) => {
  if (!imageData) return false;

  return (
    imageData.startsWith('http') || 
    imageData.startsWith('data:image')
  );
};
