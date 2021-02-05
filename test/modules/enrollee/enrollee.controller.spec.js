import { v2 as cloudinary } from 'cloudinary';
import faker from 'faker';

import getEnrollees from '../../../src/shared/samples/enrollee.samples';
import TestService from '../app/app.test.service';
import ROLES from '../../../src/shared/constants/roles.constants';
import getSampleStaffs from '../../../src/shared/samples/staff.samples';
import EnrolleeTest from './enrollee.test.service';
import TestStaff from '../staff/staff.test.services';
import { zeroPadding } from '../../../src/utils/helpers';

const { log } = console;

const originalImplementation = cloudinary.uploader.upload;
const SAMPLE_IMG_URL = faker.image.imageUrl();

describe('EnrolleeController', () => {
  beforeAll(() => {
    cloudinary.uploader.upload = jest
      .fn()
      .mockReturnValue({ url: SAMPLE_IMG_URL });
  });
  afterAll(() => {
    cloudinary.uploader.upload = originalImplementation;
  });
  describe('addNewEnrollee', () => {
    let sampleEnrollees,
      token,
      hcp,
      afrshipPrincipal,
      dsshipPrincipal,
      vcshipPrincipal,
      specialPrincipal;
    beforeAll(async () => {
      await TestService.resetDB();
      const HCPs = await TestService.seedHCPs(1);
      hcp = HCPs[0];

      sampleEnrollees = getEnrollees({
        numOfPrincipals: 4,
        sameSchemeDepPerPrincipal: 1,
        vcshipDepPerPrincipal: 1,
      });
      const principals = TestService.removeNullValues(
        sampleEnrollees.principals
      );
      afrshipPrincipal = {
        ...principals[0],
        scheme: 'AFRSHIP',
        enrolmentType: 'principal',
        hcpId: hcp.id,
      };
      dsshipPrincipal = {
        ...principals[1],
        scheme: 'DSSHIP',
        enrolmentType: 'principal',
        hcpId: hcp.id,
      };
      vcshipPrincipal = {
        ...principals[2],
        scheme: 'VCSHIP',
        enrolmentType: 'principal',
        hcpId: hcp.id,
      };
      specialPrincipal = {
        ...principals[3],
        enrolmentType: 'special-principal',
        staffNumber: undefined,
        rank: 'General',
        armOfService: 'army',
        hcpId: hcp.id,
      };
      specialPrincipal.serviceNumber =
        specialPrincipal.serviceNumber || 'SN/001/SP';
      const { sampleStaffs } = getSampleStaffs(1);
      const data = await TestService.getToken(
        sampleStaffs[0],
        ROLES.ENROLMENT_OFFICER
      );
      token = data.token;
    });

    it('can enrol an afrship principal', async (done) => {
      try {
        const res = await EnrolleeTest.enrol(afrshipPrincipal, token, {
          withUploads: true,
        });

        res.status !== 201 && log(res.body);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('data');
        const { data } = res.body;
        expect(data).toEqual(
          expect.objectContaining({
            enrolleeIdNo: zeroPadding(231),
            isPrincipal: true,
            scheme: afrshipPrincipal.scheme,
          })
        );
        done();
      } catch (e) {
        done(e);
      }
    });

    it('can enrol a dsship principal', async (done) => {
      try {
        const staff = await TestStaff.seedOne();
        const res = await EnrolleeTest.enrol(
          { ...dsshipPrincipal, staffNumber: staff.staffIdNo },
          token
        );
        res.status !== 201 && log(res.body);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('data');
        const { data } = res.body;
        expect(data).toEqual(
          expect.objectContaining({
            isPrincipal: true,
            scheme: dsshipPrincipal.scheme,
          })
        );
        done();
      } catch (e) {
        done(e);
      }
    });
    it('can enrol a vcship principal', async (done) => {
      try {
        const res = await EnrolleeTest.enrol(vcshipPrincipal, token);
        res.status !== 201 && log(res.body);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('data');
        const { data } = res.body;
        expect(data).toEqual(
          expect.objectContaining({
            isPrincipal: true,
            scheme: vcshipPrincipal.scheme,
          })
        );
        done();
      } catch (e) {
        done(e);
      }
    });
    it('can enrol a special principal', async (done) => {
      try {
        const enrolleeIdNo = '1';
        const serviceNumbers = ['A/001/SP', 'A/002/SP'];
        for (let i = 0; i < 2; i++) {
          const res = await EnrolleeTest.enrol(
            {
              ...specialPrincipal,
              enrolleeIdNo,
              serviceNumber: serviceNumbers[i],
            },
            token
          );
          if (i < 1) {
            res.status !== 201 && log(res.body);
            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('data');
            const { data } = res.body;
            expect(data).toEqual(
              expect.objectContaining({
                enrolleeIdNo: zeroPadding(enrolleeIdNo),
                isPrincipal: true,
                scheme: specialPrincipal.scheme,
              })
            );
          } else {
            res.status !== 400 && log(res.body);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
          }
        }

        done();
      } catch (e) {
        done(e);
      }
    });

    it('can enrol afrship dependants', async (done) => {
      try {
        const { dependants } = sampleEnrollees;
        const principal = await TestService.findAfrshipPrincipal({
          hcpId: hcp.id,
        });
        const dependant = TestService.removeUnwantedFields(dependants[0]);
        for (let i = 0; i < 6; i++) {
          const res = await EnrolleeTest.enrol(
            {
              ...dependant,
              enrolmentType: 'dependant',
              relationshipToPrincipal: 'child',
              principalId: principal.enrolleeIdNo,
              scheme: principal.scheme,
              hcpId: hcp.id,
            },
            token
          );
          if (i < 5) {
            res.status !== 201 && log(res.body);
            expect(res.status).toBe(201);
            const { data } = res.body;
            const { enrolleeIdNo } = data;
            const expected = `${principal.enrolleeIdNo}-${i + 1}`;
            expect(enrolleeIdNo).toEqual(expected);
          } else {
            res.status !== 400 && log(res.body);
            const { errors } = res.body;
            const { firstName, surname, scheme } = principal;
            const expectedError = `The principal, ${firstName} ${surname}, has reached the limit(5) of allowed dependants under ${scheme.toUpperCase()}`;
            expect(errors[0]).toEqual(expectedError);
          }
        }
        done();
      } catch (e) {
        done(e);
      }
    });

    it('can enrol dsship dependants', async (done) => {
      try {
        const { dependants } = sampleEnrollees;
        const principal = await TestService.findDsshipPrincipal({
          hcpId: hcp.id,
        });
        const dependant = TestService.removeUnwantedFields(dependants[0]);
        for (let i = 0; i < 6; i++) {
          const res = await EnrolleeTest.enrol(
            {
              ...dependant,
              enrolmentType: 'dependant',
              relationshipToPrincipal: 'child',
              principalId: principal.enrolleeIdNo,
              scheme: principal.scheme,
              hcpId: hcp.id,
            },
            token
          );
          if (i < 5) {
            res.status !== 201 && log(res.body);
            expect(res.status).toBe(201);
            const { data } = res.body;
            const { enrolleeIdNo } = data;
            const expected = `${principal.enrolleeIdNo}-${i + 1}`;
            expect(enrolleeIdNo).toEqual(expected);
          } else {
            res.status !== 400 && log(res.body);
            const { errors } = res.body;
            const { firstName, surname, scheme } = principal;
            const expectedError = `The principal, ${firstName} ${surname}, has reached the limit(5) of allowed dependants under ${scheme.toUpperCase()}`;
            expect(errors[0]).toEqual(expectedError);
          }
        }
        done();
      } catch (e) {
        done(e);
      }
    });
    it('can enrol vcship dependants of more than 5 in number', async (done) => {
      try {
        const { dependants } = sampleEnrollees;
        const serviceNumber = await TestService.getUniqueValue();
        const principal = await TestService.getRegisteredPrincipal({
          scheme: 'vcship',
          withValues: {
            hcpId: hcp.id,
            serviceNumber,
          },
        });
        const dependant = TestService.removeUnwantedFields(dependants[0]);
        for (let i = 0; i < 6; i++) {
          const res = await EnrolleeTest.enrol(
            {
              ...dependant,
              enrolmentType: 'dependant',
              relationshipToPrincipal: 'child',
              principalId: principal.enrolleeIdNo,
              scheme: principal.scheme,
              hcpId: hcp.id,
            },
            token
          );
          res.status !== 201 && log(res.body);
          expect(res.status).toBe(201);
          const { data } = res.body;
          const { enrolleeIdNo } = data;
          const expected = `${principal.enrolleeIdNo}-${i + 1}`;
          expect(enrolleeIdNo).toEqual(expected);
        }
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
