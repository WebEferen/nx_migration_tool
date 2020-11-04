import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

const VERSION_REGEXP = /^([A-Za-z0-9_]+\/?)+(\.[A-Za-z]+)?$/;

export function IsSafeFilePath(validationOptions?: ValidationOptions): PropertyDecorator {
    return (object: any, propertyName: string) => {
        registerDecorator({
            propertyName,
            name: 'isSafePath',
            target: object.constructor,
            constraints: [],
            options: validationOptions,
            validator: {
                validate(value: string) {
                    return VERSION_REGEXP.test(value);
                },
                defaultMessage: (validationArguments: ValidationArguments) =>
                    `${validationArguments.property} does not meet the regexp ${VERSION_REGEXP.toString()}`,
            },
        });
    };
}
