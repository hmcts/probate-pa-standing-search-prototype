const {get, set} = require('lodash')
const addressLookup = require('../services/postcodeService')

module.exports = function (router) {
  router.post('/applicant/other-executors', function (req, res) {
    if (req.body.otherExecutors === 'Yes') {
      return res.redirect('/applicant/executor-name/2')
    } else {
      return res.redirect('/deceased/name')
    }
  })

  router.post('/applicant/name-on-will', function (req, res) {
    if (req.body.applicantNameSameAsOnWill === 'Yes') {
      return res.redirect('/applicant/phone-number')
    } else {
      return res.redirect('/applicant/name-will')
    }
  })

  router.post('/applicant/name-will', function (req, res) {
    return res.redirect('/applicant/reason-name-change')
  })

  router.post('/applicant/reason-name-change', function (req, res) {
    return res.redirect('/applicant/phone-number')
  })

  router.post('/applicant/phone-number', function (req, res) {
    req.session.data.applicantPhoneNumber = req.body.applicantPhoneNumber
    return res.redirect('/applicant/address/postcode')
  })

  router.post('/applicant/address/postcode', function (req, res) {
    set(req.session.data, 'applicant.home.street1', req.body.street1)
    set(req.session.data, 'applicant.home.street2', req.body.street2)
    set(req.session.data, 'applicant.home.street3', req.body.street3)
    set(req.session.data, 'applicant.home.town', req.body.town)
    set(req.session.data, 'applicant.home.county', req.body.county)
    set(req.session.data, 'applicant.home.postcode', req.body.postcode)

    return res.redirect('/deceased/name')
  })

  router.get('/applicant/address/enter-manually', function (req, res) {
    const title = 'What is your address?'
    return res.render('common/address/enter-manually', {
      title: title,
      address: get(req.session, 'applicant.home', {})
    })
  })

  router.get('/applicant/address/enter-manually', function (req, res) {
    const title = 'What is your address?'
    return res.render('common/address/enter-manually', {
      title: title,
      address: get(req.session, 'applicant.home', {})
    })
  })

  router.get('/applicant/address/postcode', function (req, res) {
    const title = 'What is your address?'
    const postcode = get(req.session.data.applicant, 'home.postcode', '')
    addressLookup(postcode)
      .then((addresses) => {
        return res.render('common/address/postcode', {
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
    return res.render('common/address/enter-abroad', {
      title: 'What is your address?',
      hint: 'You can enter a UK or an international address.'
    })
  })

  router.post('/applicant/address/abroad', function (req, res) {
    set(req.session.data, 'applicant.home.street1', req.body.abroadAddress)
    set(req.session.data, 'applicant.home.street2', '')
    set(req.session.data, 'applicant.home.street3', '')
    set(req.session.data, 'applicant.home.town', '')
    set(req.session.data, 'applicant.home.county', '')
    set(req.session.data, 'applicant.home.postcode', '')

    return res.redirect('/deceased/name')
  })

  router.post('/applicant/address/abroad', function (req, res) {
    return res.redirect('/the-executors/how-many')
  })

  // Caveat
  router.post('/applicant/who-applying-on-behalf-of', function (req, res) {
    if (req.body.whoApplying === 'Myself') {
      return res.redirect('/applicant/name')
    } else {
      return res.redirect('/someone-else/name')
    }
  })

  router.post('/applicant/name', function (req, res) {
    return res.redirect('/applicant/email-address')
  })

  router.post('/applicant/email-address', function (req, res) {
    return res.redirect('/applicant/address/postcode')
  })

  router.post('/someone-else/name', function (req, res) {
    // req.session.data.caveatorFullName
    return res.redirect('/someone-else/authority')
  })

  router.post('/someone-else/authority', function (req, res) {
    if (req.body.permissionGiven === 'No') {
      return res.redirect('...')
    } else {
      return res.redirect('/applicant/name')
    }
  })
}
