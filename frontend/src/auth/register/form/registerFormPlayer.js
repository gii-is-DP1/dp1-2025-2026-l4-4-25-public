import { formValidators } from "../../../validators/formValidators";

export const registerFormPlayer= [
  {
    tag: "Username",
    name: "username",
    type: "text",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "Password",
    name: "password",
    type: "password",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "Complete name",
    name: "nombreApellido",
    type: "text",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "Date of birth",
    name: "fechaNacimiento",
    type: "date",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "Email",
    name: "correoElectronico",
    type: "email",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
    {
    tag: "Profile image",
    name: "imagen",
    type: "files",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
];
