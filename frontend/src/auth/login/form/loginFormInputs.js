/* import { formValidators } from "../../../validators/formValidators";

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
]; */ // PARTE DE CARLOS HAY QUE ESPERAR AL BACKEND ---> MIENTRAS TANTO USAR NOMBRE Y CONTRASEÑA QUE USAMOS EN LAB

import { formValidators } from "../../../validators/formValidators";

export const loginFormInputs = [
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
];