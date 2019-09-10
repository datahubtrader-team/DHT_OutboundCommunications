const Joi = require('@hapi/joi');
//const outboundModel = require('../models/outboundcommunication.model.js');

exports.validateOutboundSchema = (requestBody) => {

    const outboundSchema = Joi.object().keys({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        message: Joi.string(),
        email: Joi.string().email({ minDomainSegments: 2 }).required(),
        number: Joi.string(),
        status: Joi.string()
    });

    const result = Joi.validate(requestBody, outboundSchema);

    return result;
};