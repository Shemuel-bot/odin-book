const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

exports.get_user = async function getUser(header) {

    const result = await fetch('https://api.github.com/user', {
        method: 'GET',
        headers: { "Authorization" : header }
    }).then(res => {
        return res.json()
    }).then(async data => {
       const user = await prisma.user.findFirst({
            where: {
                gitId: data.id,
            }
        })
        return user
    }).catch(err => {console.log(err)})

    return result
}

