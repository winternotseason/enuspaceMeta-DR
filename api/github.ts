module.exports = async function (req: any, res: any) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: '인증 코드가 제공되지 않았습니다.' });
  }

  try {
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return res.status(401).json({ error: '토큰 교환에 실패했습니다.' });
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    const orgResponse = await fetch('https://api.github.com/user/orgs', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!orgResponse.ok) {
      return res.status(403).json({ error: '조직(Organization) 목록을 가져오는데 실패했습니다.' });
    }

    const userOrgs = await orgResponse.json();
    const orgName = process.env.VITE_GITHUB_ORG || process.env.GITHUB_ORG || 'EXPNUNI';

    if (!Array.isArray(userOrgs)) {
      return res.status(403).json({ error: '조직 목록 응답을 파싱할 수 없습니다.' });
    }

    const isMember = userOrgs.some(
      (org: any) => org.login.toLowerCase() === orgName.toLowerCase()
    );

    if (!isMember) {
      return res.status(403).json({ error: '해당 조직(Organization)의 소속 멤버만 접근 가능합니다.' });
    }

    return res.status(200).json({
      user: userData,
      token: tokenData.access_token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
};