const groupAcl = require('./_groupAcl')
const groupMenus = require('./_groupMenus')
const { authenticationCheck } = require('../util')

exports.authLogin = (req, res) => {
  const { account, password } = req.body

  if (!account || account.length === 0) {
    return res
      .status(422)
      .json([{ field: 'account', message: '请输入手机号码' }])
  }

  if (!password || password.length === 0) {
    return res.status(422).json([{ field: 'password', message: '请输入密码' }])
  }

  if (!/^1[3456789]\d{9}$/.test(account)) {
    return res
      .status(422)
      .json([{ field: 'account', message: '无效的手机号码' }])
  }

  if (account !== '13012345679') {
    return res
      .status(422)
      .json([{ field: 'account', message: '手机号码不存在' }])
  }

  if (password !== '123456') {
    return res.status(422).json([{ field: 'password', message: '密码错误' }])
  }

  return res.json({
    currentUser: {
      id: 1021,
      phone: '13012345678',
      email: '',
      name: '开发账号',
      avatar:
        'https://yuncars-other.oss-cn-shanghai.aliyuncs.com//boilerplate/201903/v4md41vswd_7477uudbmg.jpg?x-oss-process=style/avatar',
      adminGroup: { id: 101, name: '开发组' }
    },
    accessToken: 'bmq7tDtL5GqT9b64',
    groupMenus: groupMenus,
    groupPermissions: groupAcl
  })
}

exports.authLogout = (req, res) => {
  return res.json({
    message: '退出登录成功'
  })
}

exports.authAccount = (req, res) => {
  const success = {
    currentUser: {
      id: 1021,
      phone: '13012345678',
      email: '',
      name: '开发账号',
      avatar:
        'https://yuncars-other.oss-cn-shanghai.aliyuncs.com//boilerplate/201903/v4md41vswd_7477uudbmg.jpg?x-oss-process=style/avatar',
      adminGroup: { id: 101, name: '开发组' }
    },
    groupMenus: groupMenus,
    groupPermissions: groupAcl
  }

  return authenticationCheck(req, res, () => {
    res.json(success)
  })
}
