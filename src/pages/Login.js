import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';


const Login = ({ setIsLoggedIn , setnavVisible }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const changeHandler = (event) => {
    setFormData(prevData => ({
      ...prevData,
      [event.target.name]: event.target.value
    }));
  };

  const submitHandler = (event) => {
    event.preventDefault();
    setIsLoggedIn(true);
    setnavVisible(true);
    toast.success("Logged In Successfully");
    console.log("Printing the formData ");
    console.log(formData);
    navigate("/Dashboard");
  };

  return (
    <div className='flex flex-wrap lg:justify-between justify-center w-11/12 max-w-[1160px] py-6 mx-auto gap-12'>
      <div className='w-11/12 max-w-[450px] lg:order-1 order-2'>
        <h1 className='text-richblack-5 font-semibold text-[1.875rem] leading-[2.375rem]'>
          Guardian Shield: Advanced Application Firewall
        </h1>
        <p className='text-[1.125rem] leading[1.625rem] mt-4'>
          <span className='text-richblack-100'>Welcome Back to Guardian Shield!</span>
          <br />
          <span className='text-blue-100 italic'>Please enter your details to continue securing your network. We’re glad to have you back!</span>
        </p>

        <form onSubmit={submitHandler} className="flex flex-col w-full gap-y-1 mt-6">
          <label className='w-full'>
            <p className='text-[0.875rem] text-richblack-5 mb-1 leading-[1.375rem]'>
              Email Address<sup className='text-pink-200'>*</sup>
            </p>
            <input
              required
              type="email"
              value={formData.email}
              onChange={changeHandler}
              placeholder="Enter email address"
              name="email"
              className='bg-richblack-800 rounded-[0.5rem] text-richblack-5 w-full p-[12px]'
            />
          </label>

          <label className='w-full relative'>
            <p className='text-[0.875rem] text-richblack-5 mb-1 leading-[1.375rem]'>
              Password<sup className='text-pink-200'>*</sup>
            </p>
            <input
              required
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={changeHandler}
              placeholder="Enter Password"
              name="password"
              className='bg-richblack-800 rounded-[0.5rem] text-richblack-5 w-full p-[12px]'
            />
            {/* Uncomment and add icon if needed
            <span
              className='absolute right-3 top-[38px] cursor-pointer'
              onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? (<AiOutlineEyeInvisible fontSize={24} fill='#AFB2BF' />) : (<AiOutlineEye fontSize={24} fill='#AFB2BF' />)}
            </span>
            */}
          </label>

          <button className='bg-yellow-50 rounded-[8px] font-medium text-richblack-900 px-[12px] py-[8px] mt-6'>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
