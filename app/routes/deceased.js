// const {get, set, unset, parseInt, isInteger, split, slice, join} = require('lodash')
const {get, set, unset, parseInt, isInteger} = require('lodash')
const addressLookup = require('../services/postcodeService')

module.exports = function (router) {
  router.post('/deceased/about', function (req, res) {
    res.redirect('/deceased/alias')
  })

  router.post('/deceased/name', function (req, res) {
    res.redirect('/deceased/dod')
  })

  router.post('/deceased/dod', function (req, res) {
    res.redirect('/deceased/dob-known')
  })

  router.post('/deceased/alias', function (req, res) {
    if (req.body.deceasedAlias === 'Yes') {
      set(req.session, 'data.deceasedAliasCount', Math.max(1, parseInt(get(req.session, 'data.deceasedAliasCount', 0))))

      return res.redirect('/deceased/other-names')
    }
    set(req.session, 'data.deceasedAliasCount', 0)

    return res.redirect('/deceased/address-known')
  })

  router.post('/deceased/other-names', function (req, res) {
    set(req.session, 'data.deceasedAliasCount', req.body.deceasedAliasCount)

    if (req.query.add === 'true') {
      set(req.session, 'data.deceasedAliasCount', parseInt(req.body.deceasedAliasCount) + 1)
      return res.redirect('other-names')
    }

    if (isInteger(parseInt(get(req.query, 'remove', '')))) {
      let remove = parseInt(req.query.remove)
      unset(req.session, `data.deceasedOtherFirstName_${remove}`)
      unset(req.session, `data.deceasedOtherLastName_${remove}`)

      for (let i = remove + 1; i < req.session.data.deceasedAliasCount; i++) {
        set(req.session, `data.deceasedOtherFirstName_${i - 1}`, get(req.session, `data.deceasedOtherFirstName_${i}`))
        set(req.session, `data.deceasedOtherLastName_${i - 1}`, get(req.session, `data.deceasedOtherLastName_${i}`))
        unset(req.session, `data.deceasedOtherFirstName_${i}`)
        unset(req.session, `data.deceasedOtherLastName_${i}`)
      }

      req.session.data.deceasedAliasCount = Math.max(req.session.data.deceasedAliasCount - 1, 1)

      return res.redirect('other-names')
    }
    set(req.session, 'data.deceasedAliasCount', parseInt(req.body.deceasedAliasCount))

    return res.redirect('/deceased/address-known')
  })

  router.post('/deceased/will-date', function (req, res) {
    if (req.body.willDate === 'Yes') {
      return res.redirect('/deceased/codicils-new')
    }

    return res.redirect('/deceased/codicils-new')
  })

  router.post('/deceased/will-date', function (req, res) {
    res.redirect('/deceased/marital-status')
  })

  router.post('/deceased/marital-status', function (req, res) {
    if (req.body.maritalStatus === 'married or in a civil partnership') {
      return res.redirect('/deceased/married')
    }

    return res.redirect('/deceased/address/postcode')
  })

  router.post('/deceased/dob', function (req, res) {
    res.redirect('/deceased/alias')
  })

  router.post('/deceased/dob-known', function (req, res) {
    if (req.body.dobKnown === 'Yes') {
      return res.redirect('/deceased/dob')
    } else {
      return res.redirect('/deceased/alias')
    }
  })

  router.post('/deceased/domicile', function (req, res) {
    if (req.body.domicile === 'Yes') {
      return res.redirect('/deceased/address/postcode')
    }
    return res.redirect('/deceased/address/postcode')
  })

  router.get('/deceased/address/postcode', function (req, res) {
    const deceasedFirstName = req.session.data.deceasedFirstName ? req.session.data.deceasedFirstName : '[deceasedFirstName]'
    // const deceasedLastName = req.session.data.deceasedLastName ? req.session.data.deceasedLastName : '[deceasedLastName]'
    const title = `What was the permanent address of ${deceasedFirstName}?`
    const enterManuallyText = 'Enter UK address manually'
    const postcode = get(req.session.deceased, 'home.postcode', '')

    addressLookup(postcode)
      .then((addresses) => {
        return res.render(
          'common/address/postcode', {
            postcode: postcode,
            instructionText: '',
            title: title,
            outsideUKText: 'The address is outside the UK',
            addresses: addresses,
            address: get(req.session, 'deceased.home', {}),
            selectLabel: 'Select the address',
            enterManuallyText: enterManuallyText
          })
      })
  })

  router.post('/deceased/address/postcode', function (req, res) {
    set(req.session.data, 'deceased.home.street1', req.body.street1)
    set(req.session.data, 'deceased.home.street2', req.body.street2)
    set(req.session.data, 'deceased.home.street3', req.body.street3)
    set(req.session.data, 'deceased.home.town', req.body.town)
    set(req.session.data, 'deceased.home.county', req.body.county)
    set(req.session.data, 'deceased.home.postcode', req.body.postcode)

    return res.redirect('/deceased/copies')
  })

  router.get('/deceased/address/abroad', function (req, res) {
    return res.render('common/address/enter-abroad', {
      title: `What was the permanent address of ${req.session.data.deceasedFirstName}?`,
      hint: 'You can enter a UK address.'
    })
  })

  // router.get('/deceased/address/postcode', function (req, res) {
  //   return res.render('common/address/findAddressComponent', {
  //     link: 'Enter manually',
  //   })
  // })

  router.post('/deceased/address/abroad', function (req, res) {
    set(req.session.data, 'deceased.home.street1', req.body.abroadAddress)
    set(req.session.data, 'deceased.home.street2', '')
    set(req.session.data, 'deceased.home.street3', '')
    set(req.session.data, 'deceased.home.town', '')
    set(req.session.data, 'deceased.home.county', '')
    set(req.session.data, 'deceased.home.postcode', '')

    return res.redirect('/deceased/copies')
  })

  router.post('/deceased/address-known', function (req, res) {
    if (req.body.addressKnown === 'Yes') {
      return res.redirect('/deceased/address/postcode')
    } else {
      return res.redirect('/deceased/copies')
    }
  })

  router.post('/deceased/copies', function (req, res) {
    if (req.body.extraCopies === 'Yes') {
      return res.redirect('/deceased/copies-amount')
    } else {
      return res.redirect('/check-your-answers')
    }
  })

  router.post('/deceased/copies-amount', function (req, res) {
    set(req.session.data, 'copiesAmount', parseInt(get(req.session, 'req.body.copiesAmount', 0)))
    set(req.session.data, 'copiesAmountPlusOne', req.session.data.copiesAmount + 1, 0)

    return res.redirect('/check-your-answers')
  })

  // router.post('/applicant/reasons', function (req, res) {
  //  res.redirect('/applicant/name')
  // })

  router.post('/deceased/iht-method', function (req, res) {
    if (req.body.ihtMethod === 'Online (an estate report was filled in)') {
      return res.redirect('/deceased/iht-identifier')
    } else {
      return res.redirect('/deceased/iht-paper')
    }
  })
}
