import { days } from '../../utils/timers';

// eslint-disable-next-line no-unused-vars
export const getManifestWihoutZeroStats = (dialect, dbName, reqQuery = {}) => {
  const { limit, offset } = getPaginationParameters(reqQuery);

  const { searchItem, hcpCode, hcpName, date = days.today } = reqQuery;
  const fallback = '"hcpCode" IS NOT NULL';
  const generalSearch =
    searchItem &&
    `LOWER("hcpCode") LIKE '%${searchItem.toLowerCase()}%' OR LOWER("hcpName") LIKE '%${searchItem.toLowerCase()}%'`;
  const filterByHcpCode =
    hcpCode && `LOWER("hcpCode") LIKE '%${hcpCode.toLowerCase()}%'`;
  const filterByHcpName =
    hcpName && `LOWER("hcpName") LIKE '%${hcpName.toLowerCase()}%'`;
  const filter =
    filterByHcpName || filterByHcpCode || generalSearch || fallback;
  const query = {
    postgres: `
    SELECT id "hcpId", "hcpCode", "hcpName", "hcpState", "hcpStatus", MAX("verifiedOn") AS "monthOfYear", SUM("principals") principals, SUM("dependants") dependants, SUM("principals") +  SUM("dependants") lives
    FROM
      (SELECT COALESCE(p.id,d.id) id, COALESCE(p.code,d.code) "hcpCode", COALESCE(p.name,d.name) "hcpName", COALESCE(p.state,d.state) "hcpState", COALESCE(p.status,d.status) "hcpStatus", COALESCE(p."verifiedOn",d."verifiedOn") "verifiedOn", principals, dependants
      FROM
        (SELECT h.id, h.code, h.name, h.status, h.state, DATE_TRUNC('month', "dateVerified") "verifiedOn", count(*) as principals
        FROM "HealthCareProviders" h
        JOIN "Enrollees" e
            ON h.id = e."hcpId"
        WHERE e."principalId" IS NULL AND e."isVerified"=true AND e."isActive"=true AND h.status='active'
        GROUP BY h.id, h.code, h.name, DATE_TRUNC('month', "dateVerified")) AS p
      FULL OUTER JOIN
        (SELECT h.id, h.code, h.name, h.status, h.state, DATE_TRUNC('month', "dateVerified") "verifiedOn", count(*) as dependants
        FROM "HealthCareProviders" h
        JOIN "Enrollees" e
            ON h.id = e."hcpId"
        WHERE e."principalId" IS NOT NULL AND e."isVerified"=true AND e."isActive"=true AND h.status='active'
        GROUP BY h.id, h.code, h.name, DATE_TRUNC('month', "dateVerified")) AS d
      ON p.id = d.id AND p."verifiedOn" = d."verifiedOn") sub
    
    WHERE DATE_TRUNC('month', "verifiedOn") <= '${date}' AND ${filter}
    GROUP BY id, "hcpCode", "hcpName", "hcpState", "hcpStatus"
    ORDER BY lives DESC, "hcpName" ASC
    LIMIT ${limit}
    OFFSET ${offset}
      `,
    mysql: `
    `,
  };
  return query[dialect];
};
// eslint-disable-next-line no-unused-vars
export const getManifestWithZeroStats = (dialect, dbName, reqQuery = {}) => {
  const { limit, offset } = getPaginationParameters(reqQuery);

  const { searchItem, hcpCode, hcpName, date = days.today } = reqQuery;
  const fallback = '"hcpCode" IS NOT NULL';
  const generalSearch =
    searchItem &&
    `LOWER("hcpCode") LIKE '%${searchItem.toLowerCase()}%' OR LOWER("hcpName") LIKE '%${searchItem.toLowerCase()}%' OR LOWER("hcpState") LIKE '%${searchItem.toLowerCase()}%'`;
  const filterByHcpCode =
    hcpCode && `LOWER("hcpCode") LIKE '%${hcpCode.toLowerCase()}%'`;
  const filterByHcpName =
    hcpName && `LOWER("hcpName") LIKE '%${hcpName.toLowerCase()}%'`;
  const filter =
    filterByHcpName || filterByHcpCode || generalSearch || fallback;
  const query = {
    postgres: `
    SELECT id "hcpId", "hcpCode", "hcpName", "hcpState", "hcpStatus", MAX("verifiedOn") AS "monthOfYear", SUM("principals") principals, SUM("dependants") dependants,  SUM("principals") +  SUM("dependants") lives
    FROM
      (SELECT COALESCE(p.id,d.id) id, COALESCE(p.code,d.code) "hcpCode", COALESCE(p.name,d.name) "hcpName", COALESCE(p.state,d.state) "hcpState", COALESCE(p.status,d.status) "hcpStatus", COALESCE(p."verifiedOn",d."verifiedOn") "verifiedOn", principals, dependants
      FROM
        (SELECT h.id, h.code, h.name, h.status, h.state, COALESCE(DATE_TRUNC('month', "dateVerified"), '${date}') "verifiedOn", count(e.id) as principals
        FROM "HealthCareProviders" h
        LEFT JOIN "Enrollees" e
            ON h.id = e."hcpId" AND e."principalId" IS NULL AND e."isVerified"=true AND e."isActive"=true
        WHERE h.status='active'
        GROUP BY h.id, h.code, h.name, DATE_TRUNC('month', "dateVerified")) AS p
      FULL OUTER JOIN
        (SELECT h.id, h.code, h.name, h.status, h.state, COALESCE(DATE_TRUNC('month', "dateVerified"), '${date}') "verifiedOn", count(e.id) as dependants
        FROM "HealthCareProviders" h
        LEFT JOIN "Enrollees" e
            ON h.id = e."hcpId" AND e."principalId" IS NOT NULL AND e."isVerified"=true AND e."isActive"=true
        WHERE  h.status='active'
        GROUP BY h.id, h.code, h.name, DATE_TRUNC('month', "dateVerified")) AS d
      ON p.id = d.id AND p."verifiedOn" = d."verifiedOn") sub
    
    WHERE DATE_TRUNC('month', "verifiedOn") <= '${date}' AND ${filter}
    GROUP BY id, "hcpCode", "hcpName", "hcpState", "hcpStatus"
    ORDER BY lives DESC, "hcpName" ASC
   	LIMIT ${limit}
   	OFFSET ${offset}
      `,
    mysql: `
    `,
  };
  return query[dialect];
};

// eslint-disable-next-line no-unused-vars
export const getCapitationWithoutZeroStats = (
  dialect,
  dbName,
  reqQuery = {}
) => {
  const { limit, offset, date, filter } = getCapitationFilters(reqQuery);

  const query1 = `
  SELECT id "hcpId", "hcpCode", "hcpName", "hcpStatus", MAX("dateVerified") "monthOfYear", SUM(lives) lives, SUM(lives)*750 amount
  FROM
    (SELECT h.id, h.code "hcpCode", h.name "hcpName",h.status "hcpStatus", DATE_TRUNC('month', "dateVerified") "dateVerified", count(e.id) lives
    FROM "HealthCareProviders" h
    JOIN "Enrollees" e
    ON e."hcpId" = h.id AND e."isVerified"=true AND e."isActive"=true
    GROUP BY h.id, h.code, h.name, DATE_TRUNC('month', "dateVerified"))sub
  WHERE DATE_TRUNC('month', "dateVerified") <= '${date}' AND ${filter}
  GROUP BY id, "hcpCode", "hcpName", "hcpStatus"
  ORDER BY "hcpName" ASC, "monthOfYear" ASC
  LIMIT ${limit}
  OFFSET ${offset}
  `;

  const query2 = '';

  const query = { postgres: query1, mysql: query2 };
  return query[dialect];
};

// eslint-disable-next-line no-unused-vars
export const getCapitationWithZeroStats = (dialect, dbName, reqQuery = {}) => {
  const { limit, offset, date, filter } = getCapitationFilters(reqQuery);

  const query1 = `
  SELECT id "hcpId", "hcpCode", "hcpName", "hcpState", "hcpStatus", MAX("dateVerified") "monthOfYear", SUM(lives) lives, SUM(lives)*750 amount
  FROM
    (SELECT h.id, h.code "hcpCode", h.name "hcpName",h.status "hcpStatus", h.state "hcpState", COALESCE(DATE_TRUNC('month', "dateVerified"), '${date}') "dateVerified", count(e.id) lives
    FROM "HealthCareProviders" h
    LEFT JOIN "Enrollees" e
    ON e."hcpId" = h.id AND e."isVerified"=true AND e."isActive"=true
    WHERE h.status='active'
    GROUP BY h.id, h.code, h.name, DATE_TRUNC('month', "dateVerified"))sub
  WHERE DATE_TRUNC('month', "dateVerified") <= '${date}' AND ${filter}
  GROUP BY id, "hcpCode", "hcpName", "hcpState", "hcpStatus"
  ORDER BY amount DESC, "hcpName" ASC, "monthOfYear" ASC
  LIMIT ${limit}
  OFFSET ${offset}
  `;

  const query2 = '';

  const query = { postgres: query1, mysql: query2 };
  return query[dialect];
};

export const getCapitationTotals = (dialect, dbName, reqQuery = {}) => {
  const { date, filter } = getCapitationFilters(reqQuery);
  const query1 = `
  SELECT SUM(lives) lives, SUM(lives)*750 amount
  FROM
      (SELECT h.id, h.code "hcpCode", h.name "hcpName",h.status "hcpStatus", h.state "hcpState", COALESCE(DATE_TRUNC('month', "dateVerified"), '${date}') "dateVerified", count(e.id) lives
      FROM "HealthCareProviders" h
      JOIN "Enrollees" e
      ON e."hcpId" = h.id AND e."isVerified"=true AND e."isActive"=true
      WHERE h.status='active'
      GROUP BY h.id, h.code, h.name, DATE_TRUNC('month', "dateVerified"))sub
  WHERE DATE_TRUNC('month', "dateVerified") <='${date}' AND ${filter}
  `;

  const query2 = '';

  const query = { postgres: query1, mysql: query2 };
  return query[dialect];
};

function getPaginationParameters(reqQuery = {}) {
  const { page, pageSize } = reqQuery;
  const limit = Number(pageSize) || null;
  const offset = Number(page * pageSize) || 0;
  return { limit, offset };
}

function getCapitationFilters(reqQuery) {
  const { limit, offset } = getPaginationParameters(reqQuery);
  const { searchItem, hcpCode, hcpName, date = days.today } = reqQuery;
  const fallback = '"hcpCode" IS NOT NULL';
  const generalSearch =
    searchItem &&
    `LOWER("hcpCode") LIKE '%${searchItem.toLowerCase()}%' OR LOWER("hcpName") LIKE '%${searchItem.toLowerCase()}%' OR LOWER("hcpState") LIKE '%${searchItem.toLowerCase()}%'`;
  const filterByHcpCode =
    hcpCode && `LOWER("hcpCode") LIKE '%${hcpCode.toLowerCase()}%'`;
  const filterByHcpName =
    hcpName && `LOWER("hcpName") LIKE '%${hcpName.toLowerCase()}%'`;
  const filter =
    filterByHcpName || filterByHcpCode || generalSearch || fallback;
  return { limit, offset, date, filter };
}
