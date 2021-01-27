const personalData = [
  'id',
  'enrolmentType',
  'principalId',
  'scheme',
  'relationshipToPrincipal',
  'surname',
  'firstName',
  'middleName',
  'rank',
  'serviceNumber',
  'staffNumber',
  'title',
  'designation',
  'armOfService',
  'department',
  'employer',
  'dateOfBirth',
  'gender',
  'maritalStatus',
  'identificationType',
  'identificationNumber',
  'serviceStatus',
];
const contactDetails = [
  'phoneNumber',
  'email',
  'residentialAddress',
  'stateOfResidence',
  'lga',
];
const healthcareData = ['bloodGroup', 'significantMedicalHistory', 'hcpId'];
const uploads = [
  'photograph',
  'birthCertificate',
  'marriageCertificate',
  'idCard',
  'deathCertificate',
  'letterOfNok',
];

export default { personalData, contactDetails, healthcareData, uploads };

export const enrolleeFilterables = [
  'enrolmentType',
  'principalId',
  'scheme',
  'relationshipToPrincipal',
  'surname',
  'firstName',
  'middleName',
  'rank',
  'serviceNumber',
  'staffNumber',
  'title',
  'designation',
  'armOfService',
  'department',
  'employer',
  'dateOfBirth',
  'gender',
  'maritalStatus',
  'identificationType',
  'identificationNumber',
  'serviceStatus',
  ...contactDetails,
];

export const enrolleeSearchItems = [
  'surname',
  'firstName',
  'middleName',
  'scheme',
  'staffNumber',
  'serviceNumber',
  'rank',
  'principalId',
  'armOfService',
  'stateOfResidence',
  'serviceStatus',
];
