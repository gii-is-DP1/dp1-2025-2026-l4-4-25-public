import { formValidators } from "../../../validators/formValidators";

export const editProfileFormPlayer= [
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
    isRequired: false,
    validators: [],
  },
  {
    tag: "Complete name",
    name: "name",
    type: "text",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "Date of birth",
    name: "birthDate",
    type: "date",
    defaultValue: "",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  {
    tag: "Email",
    name: "email",
    type: "email",
    defaultValue: "",
    isRequired: true,
    validators: [
      formValidators.notEmptyValidator,
      formValidators.emailValidator
    ],
  }
];