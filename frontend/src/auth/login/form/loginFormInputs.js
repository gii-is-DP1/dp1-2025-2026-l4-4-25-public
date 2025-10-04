import { formValidators } from "../../../validators/formValidators";

export const loginFormInputs = [
  {
    tag: "Username",
    name: "nombreUsuario",
    type: "text",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "Password",
    name: "contrasena",
    type: "password",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
];