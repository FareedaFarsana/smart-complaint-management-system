import MainLayout from "../layouts/MainLayout"
import "../styles/createComplaint.css"
import FilterSelect from "../components/common/FilterSelect";
import Button from "../components/common/Button";

import api from "../services/api";

import { useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import Swal from "sweetalert2";

function CreateComplaint() {

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState("Low");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(null);

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const priorityOptions = [
        { value: "Low", label: "Low" },
        { value: "Medium", label: "Medium" },
        { value: "High", label: "High" }
    ];

    useEffect(() => {

        fetchCategories();

    }, []);

    const fetchCategories = async () => {

        try {

            const response = await api.get("categories/");

            console.log(response.data);

            setCategories(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (
            !title ||
            !category ||
            !priority ||
            !description
        ) {
            
            Swal.fire({
                icon: "warning",
                title: "Missing Information",
                text: "Please fill all required fields."
            });

            return;
        }

        setLoading(true);
        
        const formData = new FormData();

        formData.append("title", title);
        formData.append("category", category);
        formData.append("priority", priority);
        formData.append("description", description);

        if (image) {
            formData.append("image", image);
        }

        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        try {

            await api.post("complaints/", formData);

            Swal.fire({
                icon: "success",
                title: "Complaint Submitted",
                text: "Your complaint has been submitted successfully.",
                timer: 2000,
                showConfirmButton: false,
            });

            navigate("/complaints");

        } catch (error) {

            console.log(error.response?.data);

            Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: "Unable to submit complaint.",
            });

        } finally {

            setLoading(false);

        }
    };
    
  return (
    <MainLayout>
        
        <div className="page-header">

            <h1>Raise Complaint</h1>

            <p>
                Fill in the details below to report an issue. Our team will review and respond as soon as possible.
            </p>   

        </div>

        <div className="complaint-form-card">

            <form 
                className="complaint-form"
                onSubmit={handleSubmit}
            >

                <div className="form-group ">
                    <label>Complaint Title</label>

                    <input
                        type="text"
                        placeholder="Enter complaint title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                </div>

                <div className="form-group">

                    <label>Category</label>

                    <FilterSelect
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="choose category"
                        options={categories.map((item)=>({
                            value:item.id,
                            label:item.category_name
                        }))}
                    />

                </div>

                <div className="form-group">

                    <label>Priority</label>

                    <FilterSelect
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        placeholder="Select Priority"
                        options={priorityOptions}
                    />

                </div>

                <div className="form-group full-width">

                    <label>Description</label>

                    <textarea
                        rows="5"
                        placeholder="Describe the complaint..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                </div>

                <div className="form-group full-width">

                    <label>Upload Image</label>

                    <label className="upload-box">

                        <input
                            type="file"
                            hidden
                            onChange={(e) => setImage(e.target.files[0])}
                        />

                        <div className="upload-content">

                            <h3>📷 Upload Complaint Image</h3>

                            <p>
                                Click here to choose an image
                            </p>

                            {image && (

                                <div className="image-preview">

                                    <img
                                        src={URL.createObjectURL(image)}
                                        alt="Preview"
                                    />

                                    <span className="file-name">

                                        {image.name}

                                    </span>

                                </div>

                            )}

                        </div>

                    </label>

                </div>

                <Button 
                     type="submit"
                    loading={loading}
                >
                    Submit Complaint
                </Button>

            </form>

        </div>

    </MainLayout>
  )
}

export default CreateComplaint