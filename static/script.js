
const form = document.getElementById("profileForm");

const nameInput = document.getElementById("name");
const roleInput = document.getElementById("role");
const bioInput = document.getElementById("bio");
const imageFile = document.getElementById("imageFile");

const previewName = document.getElementById("previewName");
const previewRole = document.getElementById("previewRole");
const previewBio = document.getElementById("previewBio");

const profileImage = document.getElementById("profileImage");
const avatarPlaceholder = document.getElementById("avatarPlaceholder");

const fileName = document.getElementById("fileName");
const message = document.getElementById("message");

const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

let uploadedImage = "";
let profileGenerated = false;

// LIVE PREVIEW
function updatePreview() {
    previewName.textContent =
        nameInput.value.trim() || "Your Name";

    previewRole.textContent =
        roleInput.value.trim() || "Your Professional Title";

    previewBio.textContent =
        bioInput.value.trim() ||
        "Your story will appear here. Share your interests, passions and ambitions with the world.";
}

[nameInput, roleInput, bioInput].forEach(input => {
    input.addEventListener("input", updatePreview);
});

// PHOTO UPLOAD
imageFile.addEventListener("change", () => {
    const file = imageFile.files[0];

    uploadedImage = "";
    profileGenerated = false;
    downloadBtn.disabled = true;

    if (!file) {
        fileName.textContent = "No photograph selected";
        return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        message.textContent = "Please select a JPG, PNG or WEBP image.";
        imageFile.value = "";
        fileName.textContent = "No photograph selected";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        message.textContent = "Your image must be smaller than 5 MB.";
        imageFile.value = "";
        fileName.textContent = "No photograph selected";
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        uploadedImage = reader.result;

        profileImage.src = uploadedImage;
        profileImage.hidden = false;
        avatarPlaceholder.hidden = true;

        fileName.textContent = file.name;
        message.textContent = "Photograph uploaded successfully!";
    };

    reader.onerror = () => {
        message.textContent = "Unable to read the selected photograph.";
    };

    reader.readAsDataURL(file);
});

// GENERATE PROFILE
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!uploadedImage) {
        message.textContent = "Please upload your photograph first.";
        return;
    }

    const profileData = {
        name: nameInput.value.trim(),
        role: roleInput.value.trim(),
        bio: bioInput.value.trim(),
        image: uploadedImage
    };

    generateBtn.disabled = true;
    generateBtn.innerHTML = "Generating...";

    message.textContent = "Creating your profile...";

    try {
        const response = await fetch("/generate-profile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(profileData)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Profile generation failed.");
        }

        const profile = result.profile;

        previewName.textContent = profile.name;
        previewRole.textContent = profile.role;
        previewBio.textContent = profile.bio;

        profileImage.src = profile.image;
        profileImage.hidden = false;
        avatarPlaceholder.hidden = true;

        profileGenerated = true;
        downloadBtn.disabled = false;

        message.textContent = "Your profile has been generated successfully!";

    } catch (error) {
        message.textContent = error.message;
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'Generate profile <span>→</span>';
    }
});

// DOWNLOAD PROFILE CARD
downloadBtn.addEventListener("click", async () => {

    if (!profileGenerated) {
        message.textContent = "Generate your profile before downloading.";
        return;
    }

    if (typeof html2canvas === "undefined") {
        message.textContent = "Download library unavailable. Check your internet connection.";
        return;
    }

    downloadBtn.disabled = true;
    downloadBtn.textContent = "Preparing download...";

    try {
        const card = document.getElementById("profileCard");

        const canvas = await html2canvas(card, {
            scale: 3,
            backgroundColor: "#171522",
            useCORS: true
        });

        const link = document.createElement("a");

        link.download = "Profile-Studio-Card.png";
        link.href = canvas.toDataURL("image/png");

        document.body.appendChild(link);
        link.click();
        link.remove();

        message.textContent = "Your profile card has been downloaded!";

    } catch (error) {
        console.error(error);
        message.textContent = "Download failed. Please try again.";
    } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = "↓ Download PNG";
    }
});

// RESET FORM
resetBtn.addEventListener("click", () => {

    form.reset();

    uploadedImage = "";
    profileGenerated = false;

    previewName.textContent = "Your Name";
    previewRole.textContent = "Your Professional Title";

    previewBio.textContent =
        "Your story will appear here. Share your interests, passions and ambitions with the world.";

    profileImage.removeAttribute("src");
    profileImage.hidden = true;

    avatarPlaceholder.hidden = false;

    fileName.textContent = "No photograph selected";

    downloadBtn.disabled = true;

    message.textContent = "Your profile has been reset.";
});
