const express = require('express')
const router = express.Router()
const { deleteLog, editLog, newLog } = require('../controllers/daily-log-controller')

router.route('/new-log').post(newLog)
router.route('/edit-log/:id').patch(editLog)
router.route('/new-log').post(newLog)

module.exports = router