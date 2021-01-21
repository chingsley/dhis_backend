import Response from '../../utils/Response';
import EnrolleeService from './enrollee.service';

export default class EnrolleeController {
  static async addNewEnrollee(req, res, next) {
    try {
      const { enrolmentType } = req.body;
      const enrolleeService = new EnrolleeService(req);
      const enrollee = enrolmentType.match(/principal/i)
        ? await enrolleeService.enrolPrincipal()
        : await enrolleeService.enrolDependant();
      return res.status(201).json({ data: enrollee });
    } catch (error) {
      Response.handleError('EnrolleeController', error, req, res, next);
    }
  }
  static async getEnrollees(req, res, next) {
    try {
      const enrolleeService = new EnrolleeService(req);
      const data = await enrolleeService.getAllEnrollees();
      return res.status(201).json({ data });
    } catch (error) {
      Response.handleError('EnrolleeController', error, req, res, next);
    }
  }
  static async verifyEnrollee(req, res, next) {
    try {
      const enrolleeService = new EnrolleeService(req);
      const data = await enrolleeService.toggleEnrolleeVerification();
      return res.status(200).json({ message: 'Operation successful', data });
    } catch (error) {
      Response.handleError('EnrolleeController', error, req, res, next);
    }
  }
}
