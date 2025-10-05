import { formValidators } from "../../validators/formValidators";

export const createGameForm = [
  {
    tag: "Number of players",
    name: "",
    type: "select",
    values: ["3","4","5","6","7","8","9","10","11","12"],
    defaultValue: "3",
    isRequired: true,
    validators: [formValidators.notEmptyValidator],
  },
  
  
];
