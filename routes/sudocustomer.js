const sdk = require("api")("@sudoafrica/v1.0#dok22ieakyhpd7ym");
const express = require("express");
const router = express.Router();
const cleanBody = require("../middlewares/cleanBody");
const axios = require('axios').default;


router.post(`/`, cleanBody,  async (req, res) => {


  const options = {
    method: 'POST',
    url: 'https://api.sandbox.sudo.cards/customers',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer {{eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MmYzOTM4YjYxNTU2NWFhZmJhYTg1M2EiLCJlbWFpbEFkZHJlc3MiOiJwcmluY3pueUBnbWFpbC5jb20iLCJqdGkiOiI2MmZiOWZhMzYxMzM0YTllYzNjMThmZmMiLCJtZW1iZXJzaGlwIjp7Il9pZCI6IjYyZjM5MzhjNjE1NTY1YWFmYmFhODUzZCIsImJ1c2luZXNzIjp7Il9pZCI6IjYyZjM5MzhiNjE1NTY1YWFmYmFhODUzOCIsIm5hbWUiOiJXYXpvRGVhbCIsImlzQXBwcm92ZWQiOmZhbHNlfSwidXNlciI6IjYyZjM5MzhiNjE1NTY1YWFmYmFhODUzYSIsInJvbGUiOiJBUElLZXkifSwiaWF0IjoxNjYwNjU3NTcxLCJleHAiOjE2OTIyMTUxNzF9.nyd3wlVX4dEiZNW_ChFh9UcChLqOahlNOTdsgSdHx8w}}'},
    data: {
      type: 'individual',
      name: 'string',
      phoneNumber: 'string',
      emailAddress: 'string',
      individual: {
        firstName: 'string',
        lastName: 'string',
        otherNames: 'string',
        dob: 'string',
        identity: {type: 'BVN', number: 'string'},
        documents: {
          idFrontUrl: 'string',
          idBackUrl: 'string',
          incorporationCertificateUrl: 'string',
          addressVerificationUrl: 'string'
        }
      },
      company: {
        name: 'string',
        identity: {type: 'BVN', number: 'string'},
        officer: {
          firstName: 'string',
          lastName: 'string',
          otherNames: 'string',
          dob: 'string',
          identity: {type: 'BVN', number: 'string'},
          documents: {
            idFrontUrl: 'string',
            idBackUrl: 'string',
            incorporationCertificateUrl: 'string',
            addressVerificationUrl: 'string'
          }
        },
        documents: {
          idFrontUrl: 'string',
          idBackUrl: 'string',
          incorporationCertificateUrl: 'string',
          addressVerificationUrl: 'string'
        }
      },
      status: 'active',
      billingAddress: {
        line1: 'string',
        line2: 'string',
        city: 'string',
        state: 'string',
        postalCode: 'string',
        country: 'string'
      }
    }
  };
  
  axios
    .request(options)
    .then(function (response) {
      console.log('sudoData',response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
});

module.exports = router;
