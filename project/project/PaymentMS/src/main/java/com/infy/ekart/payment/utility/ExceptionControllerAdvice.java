package com.infy.ekart.payment.utility;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import javax.validation.ConstraintViolationException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import com.infy.ekart.payment.exception.EKartPaymentException;

@RestControllerAdvice
public class ExceptionControllerAdvice {
	@Autowired
	Environment environment;
	
	private static final Log LOGGER = LogFactory.getLog(ExceptionControllerAdvice.class);

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorInfo> generalExceptionHandler(Exception exception) {
		LOGGER.error(exception.getMessage(), exception);
		ErrorInfo error = new ErrorInfo();
		error.setErrorMessage(environment.getProperty("General.EXCEPTION_MESSAGE"));
		error.setErrorCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
		error.setTimestamp(LocalDateTime.now());
		return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
	}
	
	@ExceptionHandler({RestClientException.class, HttpClientErrorException.class})
	public ResponseEntity<ErrorInfo> restClientException(RestClientException exception) {
		LOGGER.error(exception.getMessage(), exception);
		ErrorInfo error = new ErrorInfo();
		// Best-effort: downstream EKart services return an ErrorInfo-shaped JSON body whose
		// "errorMessage" we try to surface here. This is a best-effort string scrape (not a
		// real JSON parse), so any downstream failure that *doesn't* look like that shape
		// (connection refused, timeout, a non-EKart error body) must fall back to a generic
		// message instead of throwing here — a failure in error handling itself is worse
		// than a slightly-less-specific error message.
		String fallbackMessage = environment.getProperty("General.EXCEPTION_MESSAGE");
		String errorMessage = exception.getMessage();
		if (errorMessage != null && !errorMessage.equals(fallbackMessage)) {
			try {
				String inner = errorMessage.substring(errorMessage.indexOf('{') + 1, errorMessage.indexOf('}'));
				inner = inner.split(",")[0].split(":")[1];
				errorMessage = inner.substring(inner.indexOf('"') + 1, inner.lastIndexOf('"'));
			} catch (RuntimeException parseFailure) {
				errorMessage = fallbackMessage;
			}
		}
		error.setErrorMessage(errorMessage);
		error.setErrorCode(HttpStatus.BAD_REQUEST.value());
		error.setTimestamp(LocalDateTime.now());
		return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
	}


	@ExceptionHandler(EKartPaymentException.class)
	public ResponseEntity<ErrorInfo> ekartExceptionHandler(EKartPaymentException exception) {
		LOGGER.error(exception.getMessage(), exception);
		ErrorInfo error = new ErrorInfo();
		error.setErrorMessage(environment.getProperty(exception.getMessage()));
		error.setTimestamp(LocalDateTime.now());
		HttpStatus status = exception.getStatus() != null ? exception.getStatus() : HttpStatus.BAD_REQUEST;
		error.setErrorCode(status.value());
		return new ResponseEntity<>(error, status);
	}

	@ExceptionHandler({ MethodArgumentNotValidException.class, ConstraintViolationException.class })
	public ResponseEntity<ErrorInfo> exceptionHandler(Exception exception) {
		ErrorInfo errorInfo = new ErrorInfo();
		errorInfo.setErrorCode(HttpStatus.BAD_REQUEST.value());
		String errorMsg = "";
		if (exception instanceof MethodArgumentNotValidException) {
			MethodArgumentNotValidException exception1 = (MethodArgumentNotValidException) exception;
			errorMsg = exception1.getBindingResult().getAllErrors().stream().map(x -> x.getDefaultMessage())
					.collect(Collectors.joining(", "));
		} else {
			ConstraintViolationException exception1 = (ConstraintViolationException) exception;
			errorMsg = exception1.getConstraintViolations().stream().map(x -> x.getMessage())
					.collect(Collectors.joining(", "));
		}
		errorInfo.setErrorMessage(errorMsg);
		errorInfo.setTimestamp(LocalDateTime.now());
		return new ResponseEntity<>(errorInfo, HttpStatus.BAD_REQUEST);
	}


}
