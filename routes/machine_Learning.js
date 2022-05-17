// 1. Import dependencies
const express = require('express');
const router = express.Router();
const request = require('request-promise');
const fields =['Visit',
'MR Delay',
'M/F',
'Age',
'EDUC',
'SES',
'MMSE',
'CDR',
'eTIV',
'nWBV',
'ASF']

const Visit = [
    2, 2, 1, 4, 2, 1, 3, 1, 3, 1, 1, 2, 1, 3, 2, 1, 
    1, 1, 2, 1, 1, 2, 2, 1, 2, 1, 1, 5, 3, 4, 2, 2,
    2, 1, 2, 2, 3, 2
]

const MR_Delay = [ 1707, 670, 0, 970, 764, 0, 764, 0, 866, 0, 0,
    553,  0, 1209, 1510, 0, 0, 0, 846, 0, 0, 774, 440, 0, 881, 0,
    0, 2369, 647, 1770, 539, 1047, 778, 0, 578, 733, 1282, 313, 791
]

const Gender = [ 0, 0, 1, 1, 0, 0, 1, 0, 1, 1,
    1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1,  0, 0,
    1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0
]

const Age = [
    73,  80,  82, 68, 75, 88, 80, 78, 71, 80, 80,
    73,  74,  69, 78, 63, 73, 93, 87, 66, 73, 87,
    78,  80,  65, 81, 75, 75, 68, 73, 75, 78, 91,
    75,  87,  83, 82, 77
]

const EDUC = [ 16, 8, 14, 16, 12, 12, 14,
    18,  14, 12, 12,  16, 12, 15, 18, 15,
    18,  14, 18, 18,  16, 16, 13, 12, 12,
    12,  18, 13, 16,  13, 12, 12, 13, 18,
    12,  15,  8, 18
]

const SES = [
    3.0, 5.0, 2.0, 1.0, 2.0, 4.0,
    3.0, 1.0, 4.0, 3.0, 4.0, 3.0,
    4.0, 2.0, 2.0, 2.0, 2.0, 2.0,
    1.0, 2.0, 2.0, 2.0, 2.0, 1.0,
    4.0, 4.0, 1.0, 4.0, 1.0, 4.0,
    2.0, 4.0, 3.0, 1.0, 4.0, 2.0,
    5.0, 1.0
]

const MMSE = [
    29.0, 27.0, 23.0, 7.0, 18.0, 30.0, 29.0, 30.0, 22.0,
    29.0, 28.0, 21.0, 26.0, 28.0, 30.0, 28.0, 29.0, 30.0,
    24.0, 29.0, 29.0, 30.0, 29.0, 30.0, 17.0, 30.0, 30.0,
    29.0, 19.0, 30.0, 25.0, 29.0, 28.0, 29.0, 21.0, 29.0,
    18.0, 28.0
]

const CDR = [
    0.5, 0.0, 0.5, 1.0, 1.0, 0.0, 0.5, 0.0, 1.0, 0.0,
    0.0, 1.0, 0.5, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0,
    0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.5, 0.0
]

const eTIV = [
    1287, 1381, 1514, 1714, 1479, 1336, 1324, 1440, 1332, 1783,
    1689, 1351, 1171, 1546, 1484, 1544, 1548, 1272, 1275, 1191,
    1123, 1398, 1334, 1430, 1520, 1230, 1317, 1349, 1712, 1360,
    1169, 1506, 1165, 1436, 1250, 1482, 1464, 1559
]

const nWBV = [
    0.771,  0.751,  0.678,  0.682,  0.657,  0.738,  0.695,  0.666,
    0.679,  0.752,  0.712,  0.708,  0.733,  0.724,  0.703,  0.805,
    0.773,  0.698,  0.683,  0.785,  0.786,  0.696,  0.769,  0.737,
    0.699,  0.715,  0.737,  0.778,  0.691,  0.773,  0.742,  0.715,
    0.736,  0.750,  0.652,  0.751,  0.682,  0.713
]

const ASF = [
    1.364,  1.270,  1.159,  1.024,  1.187,  1.313,  1.326,
    1.219,  1.317,  0.985,  1.039,  1.299,  1.499,  1.135,
    1.183,  1.136,  1.134,  1.380,  1.376,  1.474,  1.563,
    1.255,  1.316,  1.228,  1.155,  1.427,  1.332,  1.301,
    1.025,  1.291,  1.501,  1.166,  1.506,  1.222,  1.405,
    1.184,  1.199,  1.125
]


// 2. Setup router
router.post('/score', async (req, res) => {
    // Get access token from Watson Machine Learning
    const options = {
        method: "POST",
        url: process.env.AUTH_URL,
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            apikey: process.env.WML_API_KEY,
            grant_type: "urn:ibm:params:oauth:grant-type:apikey"
        }
    }

    
    let response = ""
    let access_token = ""

    try {
        response = await request(options);
        access_token = JSON.parse(response)["access_token"]
        // res.json({
        //     access_token
        // })
    } catch (error) {
        console.log(error)
    }

    // Scoring request

    
    
    let { patient_id } = req.body;
    patient_id = parseInt(patient_id)
    console.log(patient_id)

    console.log(Visit)
    // Populate template
    let template = [
         2,	1707,	0,	73,	16,	3.0,	29.0,	0.5,	1287,	0.771,	1.364
    ]   
    
    template[0] =Visit[patient_id]
    template[1] =MR_Delay[patient_id]
    template[2] =Gender[patient_id]
    template[3] =Age[patient_id]
    template[4] =EDUC[patient_id]
    template[5] =SES[patient_id]
    template[6] =MMSE[patient_id]
    template[7] =CDR[patient_id]
    template[8] =eTIV[patient_id]
    template[9] =nWBV[patient_id]
    template[10]=ASF[patient_id]
    
    const scoring_options = {
        method: "POST",
        url: process.env.WML_SCORING_URL,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
            "ML-Instance-ID": process.env.WML_INSTANCE_ID
        },
        body: JSON.stringify(
            {
                input_data: [
                    {
                        fields: fields,
                        values: [template]
                    }
                ]
            }
        )
    }

    let scoring_response = "";

    try {
        scoring_response = await request(scoring_options);
        res.send(scoring_response);
    } catch (error) {
        console.log(error);
        res.send(error);
    }


})
module.exports = router;