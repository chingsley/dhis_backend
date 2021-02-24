import {
  specialistCodes,
  stateCodes,
} from '../../../shared/constants/statecodes.constants';
import { Joi, stringValidate, validateIntegerId } from '../config';

export const validSpecialists = Object.keys(specialistCodes);
export const validStates = Object.keys(stateCodes);

export const getRefCodeSchema = ({ withRequiredFields = true }) => {
  return Joi.object({
    enrolleeId: validateIntegerId(withRequiredFields),
    destinationHcpId: validateIntegerId(withRequiredFields),
    reasonForReferral: stringValidate(withRequiredFields),
    diagnosis: stringValidate(withRequiredFields),
    diagnosisStatus: Joi.string()
      .trim()
      .valid('provisional', 'final')
      .required(),
    clinicalFindings: stringValidate(withRequiredFields),
    specialist: Joi.string()
      .trim()
      .lowercase()
      .valid(...validSpecialists)
      .required(),
    stateOfGeneration: Joi.string()
      .trim()
      .lowercase()
      .valid(...validStates)
      .required(),
  });
};