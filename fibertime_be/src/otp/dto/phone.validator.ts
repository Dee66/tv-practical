import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from "class-validator";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export function IsE164Phone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isE164Phone",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          if (typeof value !== "string") return false;
          const cellNumber = parsePhoneNumberFromString(value);
          return cellNumber ? cellNumber.isValid() : false;
        },
        defaultMessage: (_args: ValidationArguments) =>
          `Phone number must be valid and in E.164 format (e.g. +12345678901)`,
      },
    });
  };
}
