import moment from 'moment';
import db from '../../../src/database/models';
import getSampleStaffs from '../../../src/shared/samples/staff.samples';
import TestService from '../app/app.test.service';

export const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
export const today = moment().format('YYYY-MM-DD');
export const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

class _StaffService extends TestService {
  static async seedOne(staff = this.getSamples(1)[0]) {
    const [result] = await db.Staff.upsert(staff, { returning: true });
    return result;
  }

  static getSamples(count = 1) {
    const { sampleStaffs } = getSampleStaffs(count);
    return sampleStaffs;
  }

  static seedBulk(staffs) {
    return db.Staff.bulkCreate(staffs);
  }

  static findOneWhere(condition) {
    return db.Staff.findOne({ where: condition });
  }
}

export default _StaffService;
