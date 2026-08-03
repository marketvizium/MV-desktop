function exibeErro(payload, toastGlobal){

    console.log(payload, "olha aii")
    
    if(!payload.response){
        if(payload.message){
            toastGlobal.error('Erro no login.', "--" , payload.message)
        }else{
            toastGlobal.error('Erro desconhecido... Por favor, tente novamente mais tarde.', '--', '--')
        }
    }else{
        if(payload.response.data){
            console.log("A")
            if(payload.response.data.COD){
                toastGlobal.error('Erro encontrado. ', payload.response.data.COD, payload.response.data.MSG)
            }else if(payload.response.data.body){
                toastGlobal.error('Erro encontrado. ', payload.response.data.body.COD, payload.response.data.body.MSG)
            }
        }else if(payload.response.COD){
            console.log("b")
            toastGlobal.error('Erro encontrado. ', payload.response.COD, payload.response.MSG)
        }
    }
}

export default exibeErro