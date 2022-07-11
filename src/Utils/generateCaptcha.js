const {svg2png} = require ('svg-png-converter')
const svgCaptcha = require('svg-captcha');

module.exports = async function(){

    var captcha = svgCaptcha.create({size: 4, background: "#ffffff",color: true, noise: 1});

    const img = await svg2png({ 
        input: captcha?.data, 
        encoding: 'buffer', 
        format: 'jpeg',
        quality: 1,
        multiplier: 5,
        enableRetinaScaling: true,

      })

    return {imgBuffer: img, answer: captcha?.text}

}