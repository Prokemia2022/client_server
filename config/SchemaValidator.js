const yup = require('yup');
const EmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const SIGNUP_VALIDATION_SCHEMA = yup.object({
	body: yup.object({
		first_name:		yup.string().required(),
		last_name:		yup.string().required(),
		email:			yup.string().email().matches(EmailRegex).required(),
		mobile:			yup.string().required(),
		account_type:	yup.string().required(),
		password:		yup.string().min(6).max(16).required(),
	})
});

const SIGNIN_VALIDATION_SCHEMA = yup.object({
	body: yup.object({
		email:			yup.string().email().matches(EmailRegex).required(),
		password:		yup.string().min(6).max(16).required(),
	})
});

const PASSWORD_RESET_VALIDATION_SCHEMA = yup.object({
  query: yup.object({
    email: yup.string().email().required().matches(EmailRegex, 'Email address must be of correct format'),
  })
});

const NEW_PASSWORD_RESET_VALIDATION_SCHEMA = yup.object({
  body: yup.object({
    new_password:   yup.string().required().min(6).max(16),
  }),
  query: yup.object({
    email: yup.string().email().required().matches(EmailRegex, 'Email address must be of correct format'),
  })
});

const VERIFY_USER_ACCOUNT_VALIDATION_SCHEMA = yup.object({
  query: yup.object({
    email: yup.string().email().required().matches(EmailRegex, 'Email address must be of correct format'),
  })
});


const FLAG_USER_DELETION_VALIDATION_SCHEMA = yup.object({
	query:	yup.object({
		user_id: yup.string().length(24, 'User ID Format length validation error').required('User ID is required'),
	}),
	body:	yup.object({
		reason:	yup.string('')
	})
});

const FETCH_USER_DETAILS_VALIDATION_SCHEMA = yup.object({
  query: yup.object({
    user_id:          yup.string().length(24, 'User ID Format length validation error').required('User ID is required'),
  })
});

const FETCH_USER_ACCOUNT_VALIDATION_SCHEMA = yup.object({
  query: yup.object({
    user_id:          yup.string().length(24, 'User ID Format length validation error').required('User ID is required'),
  })
});

const UPDATE_USER_DETAILS_VALIDATION_SCHEMA = yup.object({
	body: yup.object({
		first_name:		yup.string(),
		last_name:		yup.string(),
		mobile:			yup.string(),
		profile_image_url: yup.string(),
		products:		yup.array()
	}),
	query: yup.object({
		user_id:		yup.string().length(24, 'User ID Format length validation error').required('User ID is required'),
	})
});

const UPDATE_USER_ACCOUNT_DETAILS_VALIDATION_SCHEMA = yup.object({
	body: yup.object({
		name:			yup.string(),
		position:		yup.string(),
		email:			yup.string().email().matches(EmailRegex),
		mobile:			yup.string(),
		address:		yup.string()
	}),
	query: yup.object({
		user_id:		yup.string().length(24, 'User ID Format length validation error').required('User ID is required'),
	})
});


module.exports = {
	SIGNUP_VALIDATION_SCHEMA,
	SIGNIN_VALIDATION_SCHEMA,
	PASSWORD_RESET_VALIDATION_SCHEMA,
	NEW_PASSWORD_RESET_VALIDATION_SCHEMA,
	VERIFY_USER_ACCOUNT_VALIDATION_SCHEMA,
	FLAG_USER_DELETION_VALIDATION_SCHEMA,
	FETCH_USER_ACCOUNT_VALIDATION_SCHEMA,
	FETCH_USER_DETAILS_VALIDATION_SCHEMA,
	UPDATE_USER_DETAILS_VALIDATION_SCHEMA,
	UPDATE_USER_ACCOUNT_DETAILS_VALIDATION_SCHEMA
}
