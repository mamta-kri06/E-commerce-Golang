package controllers

func pick(v, fallback string) string {
	if v == "" {
		return fallback
	}
	return v
}

