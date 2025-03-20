from database import (
    verifyLogin, newUser, newListing, 
    approve_listing, reject_listing, delete_approved_listing, 
    claim_item, sell_item, upload_image_to_blob
)

if __name__ == '__main__':
    while True:
        print("\nAvailable tests:")
        print("1. Test Login")
        print("2. Test New User Creation")
        print("3. Test New Listing Creation")
        print("4. Test Approving a Listing")
        print("5. Test Rejecting a Listing")
        print("6. Test Deleting an Approved Listing")
        print("7. Test Claiming an Item")
        print("8. Test Selling an Item")
        print("9. Test Uploading Image to Blob Storage")
        print("0. Exit")

        choice = input("Choose a test to run (0-9): ").strip()

        if choice == "1":
            user_id = input("Enter User ID: ")
            password = input("Enter Password: ")
            result = verifyLogin(user_id, password)
            print("Login Success!" if result else "Login Failed.")

        elif choice == "2":
            user_id = input("Enter User ID: ")
            email = input("Enter Email: ")
            password = input("Enter Password: ")
            is_admin = int(input("Is Admin (0/1): "))
            first_name = input("Enter First Name: ")
            last_name = input("Enter Last Name: ")
            is_student = int(input("Is Student (0/1): "))
            newUser(user_id, email, password, is_admin, first_name, last_name, is_student)

        elif choice == "3":
            list_user = input("Enter List User: ")
            list_name = input("Enter List Name: ")
            category = int(input("Enter Category (SKU): "))
            description = input("Enter Description: ")
            claim_description = input("Enter Claim Description: ")
            is_claimed = int(input("Is Claimed (0/1): "))
            picture1 = input("Enter Picture 1 URL: ")
            picture2 = input("Enter Picture 2 URL: ")
            newListing(list_user, list_name, category, description, claim_description, is_claimed, picture1, picture2)

        elif choice == "4":
            list_id = int(input("Enter Listing ID to Approve: "))
            approve_listing(list_id)

        elif choice == "5":
            list_id = int(input("Enter Listing ID to Reject: "))
            reject_listing(list_id)

        elif choice == "6":
            list_id = int(input("Enter Listing ID to Delete: "))
            delete_approved_listing(list_id)

        elif choice == "7":
            claim_list_id = int(input("Enter Listing ID to Claim: "))
            claimed_user_id = input("Enter User ID of Claimer: ")
            claimed_review = input("Enter Review: ")
            claimed_rating = int(input("Enter Rating (1-5): "))
            claim_item(claim_list_id, claimed_user_id, claimed_review, claimed_rating)

        elif choice == "8":
            sold_list_id = int(input("Enter Listing ID Marked as Sold: "))
            sold_review = input("Enter Seller Review: ")
            sold_rating = int(input("Enter Rating (1-5): "))
            sell_item(sold_list_id, sold_review, sold_rating)

        elif choice == "9":
            filename = input("Enter filename for the image: ")
            with open(filename, "rb") as image_file:
                url = upload_image_to_blob(image_file, filename)
                if url:
                    print(f"Image uploaded successfully! URL: {url}")
                else:
                    print("Image upload failed.")

        elif choice == "0":
            print("Exiting test suite.")
            break

        else:
            print("Invalid choice. Please select a valid test option.")
