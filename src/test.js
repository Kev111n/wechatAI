import jwt from 'jsonwebtoken'
import axios from 'axios'

function createToken(apikey) {
    const [id, secret] = apikey.split('.')

    const header = { "alg": "HS256", "sign_type": "SIGN" }
    const payload = {
        "api_key": id,
        "exp": Math.floor(Date.now()) + 60 * 1000,
        "timestamp": Math.floor(Date.now())
    }

    const token = jwt.sign(payload, secret, { header }, { algorithm: 'HS256' })
    return token
}

const apikey = "594d5a2a4eae74986a42647fdb9e7ac0.8jTs22TezLnh2bu3"
const token = createToken(apikey)
const potUrl = 'https://open.bigmodel.cn/api/paas/v4/async/chat/completions'
const getUrl = 'https://open.bigmodel.cn/api/paas/v4/async-result/'

// const prompt = {
//     model : "glm-4",
//     messages: [
//         // {"role": "user", "content": "作为一名营销专家，请为我的产品创作一个吸引人的slogan"},
//         // {"role": "assistant", "content": "当然，为了创作一个吸引人的slogan，请告诉我一些关于您产品的信息"},
//     ]
// }


async function sendQuestion(msg, prompt) {
    prompt.messages.push({ "role": "user", "content": msg })
    let responseMsg = ''
    const data = await axios({
        method: 'post',
        url: potUrl,
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        data: prompt
    }).catch(err => {
        console.log(err.response.status, err.response.data)
    })

    let queryTimer = setInterval(async () => {
        const response = await axios({
            method: 'get',
            url: getUrl + data.data.id,
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        }).catch(err => {
            console.log(err.response.status, err.response.data)
        })

        if (response.data.task_status === 'SUCCESS') {
            clearInterval(queryTimer)
            responseMsg = response.data.choices[0].message.content
            prompt.messages.push({ "role": "assistant", "content": responseMsg })
        }
    }, 5000)

    return responseMsg
}

export default sendQuestion