const serverless = require('serverless-http');
const express = require('express');
const fs = require('fs');
const process = require('process');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/pincode-check', (req, res) => {
	try {
		console.log('pincode-check', req.query);

		const payload = req.query;
		if (!payload.product_id || !payload.pincode) {
			return res.status(400).json({
				error: true,
				message: 'Missing Query Parameters'
			});
		}
		console.log('payload', payload);
		const pincodes = loadPincodes();
		console.log('pincodes loaded', pincodes);
		let deliverablePincodes;

		pincodes.forEach((pincode) => {
			if (payload.product_id === pincode.product_id) {
				deliverablePincodes = pincode.pincodes.split(',');
			}
		});

		console.log('deliverablePincodes', deliverablePincodes);
		if (!deliverablePincodes) {
			return res.status(400).json({
				error: true,
				message: 'Product not available'
			});
		}

		const isDeliverable = deliverablePincodes.includes(payload.pincode);
		console.log('isDeliverable', isDeliverable);
		return res.status(200).json({
			pincode: payload.pincode,
			isDeliverable
		});
	} catch (error) {
		console.error('error is', error);
		return res.status(500).json({
			error: true,
			message: error.message
		});
	}
});
app.post('/upload', (req, res) => {
	try {
		const payload = req.body;
		console.log('payload is', payload);
		savePincodes(payload.data);

		return res.status(200).json({
			message: 'Pincodes uploded successfully!'
		});
	} catch (error) {
		console.error('error is', error);
		return res.status(500).json({
			error: true,
			message: error.message
		});
	}
});

const savePincodes = (pincode) => {
	try {
		console.log('Starting directory: ', process.cwd());
		process.chdir('/tmp');
		console.log('New directory: ', process.cwd());
		const dataJSON = JSON.stringify(pincode);
		fs.writeFileSync(`${process.cwd()}/pincodes.json`, dataJSON);
	} catch (error) {
		console.log('error in saving pincodes', error);
	}
};

const loadPincodes = () => {
	try {
		console.log('Starting directory: ', process.cwd());
		process.chdir('/tmp');
		console.log('New directory: ', process.cwd());
		const dataBuffer = fs.readFileSync(`${process.cwd()}/pincodes.json`);
		const dataJSON = dataBuffer.toString();
		console.log('dataJson', dataJSON);
		return JSON.parse(dataJSON);
	} catch (error) {
		console.log('error in loading pincodes', error);
		return [];
	}
};

//app.listen(3000, () => console.log(`Listening on: 3000`));
module.exports.handler = serverless(app);
