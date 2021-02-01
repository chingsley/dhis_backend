// import supertest from 'supertest';
import moment from 'moment';
import db from '../../../src/database/models';
import getSampleStaffs from '../../../src/shared/samples/staff.samples';

// import server from '../../../src/server';
// import TestService from '../app/app.test.service';

export const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
export const today = moment().format('YYYY-MM-DD');
export const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');

// const app = supertest(server.server);

class TestStaff {
  static async seedOne(staff = this.getSamples(1)[0]) {
    const [result] = await db.Staff.upsert(staff, { returning: true });
    return result;
  }

  static getSamples(count = 1) {
    const { sampleStaffs } = getSampleStaffs(count);
    return sampleStaffs;
  }
}

export default TestStaff;
