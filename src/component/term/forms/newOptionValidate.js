const validateLengthMin5 = (value, values, i18n) => {
    return !value || value.length < 5
        ? i18n('glossary.form.validation.validateLengthMin5')
        : null;
};

const validateLengthMin3 = (value, values, i18n) => {
    return !value || value.length < 3
        ? i18n('glossary.form.validation.validateLengthMin3')
        : null;
};

// tslint:disable:no-console
const validateNotSameAsParent = (value, values, i18n, valueKey) => {
    if (values.parentOption && value) {
        for (let i = 0; i < value.length; i++) {
            if (value[i][valueKey] === values.parentOption[valueKey]) {
                return i18n('glossary.form.validation.validateNotSameAsParent')
            }
        }
    }
    return null;
};

function isEquivalent(a, b) {
    // Create arrays of property names
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (let i = 0; i < aProps.length; i++) {
        const propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}


export {validateLengthMin3, validateLengthMin5, validateNotSameAsParent}
