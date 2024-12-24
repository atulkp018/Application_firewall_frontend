import React from 'react'
import frameImage from "../assets/frame.png"
import LoginForm from './LoginForm'
// import {FcGoogle} from "react-icons/fc"


const Template = ({title, desc1, desc2, image, formType, setIsLoggedIn}) => {


  return (
    <div className='flex flex-wrap lg:justify-between justify-center w-11/12 max-w-[1160px] py-6 mx-auto gap-12'>

        <div className='w-11/12 max-w-[450px] lg:order-1 order-2' >
            <h1
            className='text-richblack-5 font-semibold text-[1.875rem] leading-[2.375rem]' 
            >
                {title}
            </h1>

            <p className='text-[1.125rem] leading[1.625rem] mt-4' >
                <span className='text-richblack-100'>{desc1}</span>
                <br/>
                <span className='text-blue-100 italic'>{desc2}</span>
            </p>


            <LoginForm setIsLoggedIn={setIsLoggedIn}/>

            

        </div>

    </div>
  )
}

export default Template
