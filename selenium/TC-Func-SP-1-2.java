import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.*;
import org.testng.Assert;
import org.testng.annotations.*;

public class TC-Func-SP-1-2_Test {

    private WebDriver driver;
    private WebDriverWait wait;

    @BeforeMethod
    public void setUp() {
        // Assuming chromedriver executable is in system PATH
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, java.time.Duration.ofSeconds(10));
    }

    @AfterMethod
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void test_TC_Func_SP_1_2() {
        // Navigate to the signup page
        driver.get("https://example.com/signup"); // TODO: replace with actual signup URL

        // Locate elements (replace the TODO selectors with real ones)
        By emailField = By.cssSelector("[data-testid='TODO']");
        By passwordField = By.cssSelector("[data-testid='TODO']");
        By submitButton = By.cssSelector("[data-testid='TODO']");
        By errorMessage = By.cssSelector("[data-testid='TODO']");

        // Enter existing email
        WebElement emailElem = wait.until(ExpectedConditions.visibilityOfElementLocated(emailField));
        emailElem.clear();
        emailElem.sendKeys("existinguser@example.com");

        // Enter a valid password
        WebElement passwordElem = wait.until(ExpectedConditions.visibilityOfElementLocated(passwordField));
        passwordElem.clear();
        passwordElem.sendKeys("ValidPassword123!");

        // Submit the signup form
        WebElement submitElem = wait.until(ExpectedConditions.elementToBeClickable(submitButton));
        submitElem.click();

        // Wait for the error message to appear
        WebElement errorElem = wait.until(ExpectedConditions.visibilityOfElementLocated(errorMessage));
        String actualError = errorElem.getText();

        // Validate that the error indicates the email is already in use
        Assert.assertTrue(actualError.toLowerCase().contains("already in use"),
                "Expected error message about email already in use, but got: " + actualError);
    }
}