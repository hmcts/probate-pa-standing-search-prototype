const {get, set} = require('lodash')
const addressLookup = require('../services/postcodeService')

module.exports = function (router) {
  router.post('/applicant/other-executors', function (req, res) {
    if (req.body.otherExecutors === 'Yes') {
      res.redirect('/applicant/executor-name/2')
    } else {
      res.redirect('/deceased/name')
    }
  })



  router.post('/applicant/name-on-will', function (req, res) {
    if (req.body.applicantNameSameAsOnWill === 'Yes') {
      res.redirect('/applicant/phone-number')
    } else {
      res.redirect('/applicant/name-will')
    }
  })

  router.post('/applicant/name-will', function (req, res) {
    res.redirect('/applicant/reason-name-change')
  })

  router.post('/applicant/reason-name-change', function (req, res) {
     res.redirect('/applicant/phone-number')
  })

  router.post('/applicant/phone-number', function (req, res) {
    req.session.data.applicantPhoneNumber = req.body.applicantPhoneNumber
    res.redirect('/applicant/address/postcode')
  })

  router.post('/applicant/address/postcode', function (req, res) {
    set(req.session.data, 'applicant.home.street1', req.body.street1)
    set(req.session.data, 'applicant.home.street2', req.body.street2)
    set(req.session.data, 'applicant.home.street3', req.body.street3)
    set(req.session.data, 'applicant.home.town', req.body.town)
    set(req.session.data, 'applicant.home.county', req.body.county)
    set(req.session.data, 'applicant.home.postcode', req.body.postcode)

    res.redirect('/check-your-answers')
  })

  router.get('/applicant/address/enter-manually', function (req, res) {
    const title = 'What is your address?'
    res.render('common/address/enter-manually', {
      title: title,
      address: get(req.session, 'applicant.home', {})
    })
  })

  router.get('/applicant/address/enter-manually', function (req, res) {
    const title = 'What is your address?'
    res.render('common/address/enter-manually', {
      title: title,
      address: get(req.session, 'applicant.home', {})
    })
  })

  router.get('/applicant/address/postcode', function (req, res) {
    const title = 'What is your address?'
    const postcode = get(req.session.data.applicant, 'home.postcode', '')
    addressLookup(postcode)
      .then((addresses) => {
        res.render('common/address/postcode', {
          postcode: postcode,
          instructionText: '',
          title: title,
          outsideUKText: 'My address is outside the UK',
          addresses: addresses,
          address: get(req.session, 'applicant.home', {}),
          selectLabel: 'Select your address'
        })
      })
  })

  router.get('/applicant/address/abroad', function (req, res) {
    res.render('common/address/enter-abroad', {
      title: 'What is your address?'
    })
  })

  router.post('/applicant/address/abroad', function (req, res) {
    set(req.session.data, 'applicant.home.street1', req.body.abroadAddress)
    set(req.session.data, 'applicant.home.street2', '')
    set(req.session.data, 'applicant.home.street3', '')
    set(req.session.data, 'applicant.home.town', '')
    set(req.session.data, 'applicant.home.county', '')
    set(req.session.data, 'applicant.home.postcode', '')

    res.redirect('/check-your-answers')
  })

  router.post('/applicant/address/abroad', function (req, res) {
    res.redirect('/the-executors/how-many')
  })

  // Caveat
    router.post('/applicant/who-applying-on-behalf-of', function (req, res) {
    if (req.body.whoApplying === 'Myself') {
      res.redirect('/applicant/name')
    } else {
      res.redirect('/someone-else/name')
    }
  })

  router.post('/applicant/name', function (req, res) {
    res.redirect('/applicant/email-address')
  })

  router.post('/applicant/email-address', function (req, res) {
    res.redirect('/applicant/address/postcode')
  })

  router.post('/someone-else/name', function (req, res) {
    req.session.data.caveatorFullName
    res.redirect('/someone-else/authority')
  })

    router.post('/someone-else/authority', function (req, res) {
    if (req.body.permissionGiven === 'No') {
      res.redirect('...')
    } else {
      res.redirect('/applicant/name')
    }
  })
}
