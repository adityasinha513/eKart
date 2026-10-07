package com.infy.ekart.customer.dto;

public class AdminCustomerDTO {
	private String emailId;
	private String name;
	private String phoneNumber;
	private Integer orderCount;

	public String getEmailId() { return emailId; }
	public void setEmailId(String emailId) { this.emailId = emailId; }
	public String getName() { return name; }
	public void setName(String name) { this.name = name; }
	public String getPhoneNumber() { return phoneNumber; }
	public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
	public Integer getOrderCount() { return orderCount; }
	public void setOrderCount(Integer orderCount) { this.orderCount = orderCount; }
}
